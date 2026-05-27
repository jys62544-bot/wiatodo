use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, TrayIconBuilder, TrayIconEvent};
use tauri::{Emitter, Manager};

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![exit_app])
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

fn show_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}
