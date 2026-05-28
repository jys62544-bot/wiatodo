use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, TrayIconBuilder, TrayIconEvent};
use tauri::{Emitter, Manager};

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![exit_app, get_system_metrics])
        .setup(|app| {
            setup_tray(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn setup_tray(app: &mut tauri::App) -> tauri::Result<()> {
    let show_panel = MenuItem::with_id(app, "show_panel", "显示待办", true, None::<&str>)?;
    let show_icon = MenuItem::with_id(app, "show_icon", "显示悬浮图标", true, None::<&str>)?;
    let toggle_lock = MenuItem::with_id(app, "toggle_lock", "锁定/解锁位置", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "退出程序", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show_panel, &show_icon, &toggle_lock, &quit])?;

    let mut tray_builder = TrayIconBuilder::new()
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::DoubleClick {
                button: MouseButton::Left,
                ..
            } = event
            {
                let app = tray.app_handle();
                show_main_window(app);
                let _ = app.emit_to("main", "tray-show-mode", "floating_icon");
            }
        })
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show_panel" => {
                show_main_window(app);
                let _ = app.emit_to("main", "tray-show-mode", "todo_panel");
            }
            "show_icon" => {
                show_main_window(app);
                let _ = app.emit_to("main", "tray-show-mode", "floating_icon");
            }
            "toggle_lock" => {
                let _ = app.emit_to("main", "tray-toggle-lock", ());
            }
            "quit" => {
                let _ = app.emit_to("main", "tray-request-exit", ());
                let app_handle = app.clone();
                std::thread::spawn(move || {
                    std::thread::sleep(std::time::Duration::from_millis(1500));
                    app_handle.exit(0);
                });
            }
            _ => {}
        });

    if let Some(icon) = app.default_window_icon() {
        tray_builder = tray_builder.icon(icon.clone());
    }

    tray_builder.build(app)?;
    Ok(())
}

#[tauri::command]
fn exit_app(app: tauri::AppHandle) {
    app.exit(0);
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct SystemMetrics {
    cpu_percent: Option<f64>,
    memory_percent: f64,
    memory_used_gb: f64,
    memory_total_gb: f64,
}

#[tauri::command]
fn get_system_metrics() -> Result<SystemMetrics, String> {
    system_metrics::get_system_metrics()
}

fn show_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

#[cfg(target_os = "windows")]
mod system_metrics {
    use super::SystemMetrics;
    use std::ffi::c_void;
    use std::sync::{Mutex, OnceLock};
    use windows::core::{w, PCWSTR};
    use windows::Win32::System::Performance::{
        PdhAddEnglishCounterW, PdhCollectQueryData, PdhGetFormattedCounterValue, PdhOpenQueryW,
        PDH_FMT_COUNTERVALUE, PDH_FMT_DOUBLE, PDH_HCOUNTER, PDH_HQUERY,
    };
    use windows::Win32::System::SystemInformation::{GlobalMemoryStatusEx, MEMORYSTATUSEX};

    const PDH_SUCCESS: u32 = 0;
    static CPU_MONITOR: OnceLock<Mutex<CpuMonitor>> = OnceLock::new();

    pub fn get_system_metrics() -> Result<SystemMetrics, String> {
        let memory = read_memory_metrics()?;
        let cpu_percent = read_cpu_percent();

        Ok(SystemMetrics {
            cpu_percent,
            memory_percent: round_one(memory.memory_percent),
            memory_used_gb: round_one(memory.memory_used_gb),
            memory_total_gb: round_one(memory.memory_total_gb),
        })
    }

    fn read_cpu_percent() -> Option<f64> {
        let monitor = CPU_MONITOR.get_or_init(|| Mutex::new(CpuMonitor::new()));
        let mut monitor = monitor.lock().ok()?;
        monitor.sample()
    }

    fn read_memory_metrics() -> Result<MemoryMetrics, String> {
        let mut status = MEMORYSTATUSEX {
            dwLength: std::mem::size_of::<MEMORYSTATUSEX>() as u32,
            ..Default::default()
        };

        unsafe {
            GlobalMemoryStatusEx(&mut status).map_err(|error| format!("read memory metrics failed: {error}"))?;
        }

        let total = status.ullTotalPhys as f64;
        let available = status.ullAvailPhys as f64;
        let used = (total - available).max(0.0);
        let gb = 1024.0 * 1024.0 * 1024.0;

        Ok(MemoryMetrics {
            memory_percent: if total > 0.0 { used / total * 100.0 } else { 0.0 },
            memory_used_gb: used / gb,
            memory_total_gb: total / gb,
        })
    }

    struct MemoryMetrics {
        memory_percent: f64,
        memory_used_gb: f64,
        memory_total_gb: f64,
    }

    struct CpuMonitor {
        query: Option<usize>,
        utility_counter: Option<usize>,
        time_counter: Option<usize>,
        has_baseline: bool,
    }

    impl CpuMonitor {
        fn new() -> Self {
            let mut query = PDH_HQUERY::default();
            let query_result = unsafe { PdhOpenQueryW(PCWSTR::null(), 0, &mut query) };

            if !is_pdh_success(query_result) {
                return Self {
                    query: None,
                    utility_counter: None,
                    time_counter: None,
                    has_baseline: false,
                };
            }

            let utility_counter = add_counter(query, w!("\\Processor Information(_Total)\\% Processor Utility"));
            let time_counter = add_counter(query, w!("\\Processor(_Total)\\% Processor Time"));

            unsafe {
                let _ = PdhCollectQueryData(query);
            }

            Self {
                query: Some(query.0 as usize),
                utility_counter,
                time_counter,
                has_baseline: false,
            }
        }

        fn sample(&mut self) -> Option<f64> {
            let query = self.query()?;

            unsafe {
                if !is_pdh_success(PdhCollectQueryData(query)) {
                    return None;
                }
            }

            if !self.has_baseline {
                self.has_baseline = true;
                return None;
            }

            let percent = self
                .utility_counter
                .and_then(format_counter_value)
                .or_else(|| self.time_counter.and_then(format_counter_value))?;

            Some(round_one(percent.clamp(0.0, 100.0)))
        }

        fn query(&self) -> Option<PDH_HQUERY> {
            self.query.map(|handle| PDH_HQUERY(handle as *mut c_void))
        }
    }

    fn add_counter(query: PDH_HQUERY, path: PCWSTR) -> Option<usize> {
        let mut counter = PDH_HCOUNTER::default();

        unsafe {
            if !is_pdh_success(PdhAddEnglishCounterW(query, path, 0, &mut counter)) {
                return None;
            }
        }

        Some(counter.0 as usize)
    }

    fn format_counter_value(counter: usize) -> Option<f64> {
        let counter = PDH_HCOUNTER(counter as *mut c_void);
        let mut value = PDH_FMT_COUNTERVALUE::default();

        unsafe {
            if !is_pdh_success(PdhGetFormattedCounterValue(counter, PDH_FMT_DOUBLE, None, &mut value)) {
                return None;
            }

            Some(value.Anonymous.doubleValue)
        }
    }

    fn is_pdh_success(status: u32) -> bool {
        status == PDH_SUCCESS
    }

    fn round_one(value: f64) -> f64 {
        (value * 10.0).round() / 10.0
    }
}

#[cfg(not(target_os = "windows"))]
mod system_metrics {
    use super::SystemMetrics;

    pub fn get_system_metrics() -> Result<SystemMetrics, String> {
        Ok(SystemMetrics {
            cpu_percent: None,
            memory_percent: 0.0,
            memory_used_gb: 0.0,
            memory_total_gb: 0.0,
        })
    }
}
