function xcode_close_ws --description 'Close open Xcode workspaces (fzf or --path)'
    if set -q argv[1]; and contains -- $argv[1] -h --help
        echo "用法:"
        echo "  xcode_close_ws                 # fzf 多选关闭"
        echo "  xcode_close_ws --path <path>…  # 非交互关闭指定 path"
        return 0
    end

    set -l paths
    if set -q argv[1]; and test "$argv[1]" = --path
        set -e argv[1]
        if test (count $argv) -eq 0
            set_color red; echo "[error] --path 需要至少一个 workspace 路径"; set_color normal
            return 1
        end
        set paths $argv
    else if test (count $argv) -gt 0
        set_color red; echo "[error] 未知参数: $argv"; set_color normal
        echo "用法: xcode_close_ws [--path <path>…]"
        return 1
    else
        if not command -q fzf
            set_color red; echo "[error] 需要 fzf，先安装: brew install fzf"; set_color normal
            return 1
        end

        set -l open_list (
            osascript -e '
                tell application "Xcode"
                    set out to ""
                    repeat with d in (every workspace document)
                        set out to out & (path of d) & linefeed
                    end repeat
                    return out
                end tell
            ' 2>/dev/null | string match -r '.+'
        )
        if test (count $open_list) -eq 0
            set_color yellow; echo "[warn] Xcode 未在运行，或没有已打开的 workspace"; set_color normal
            return 0
        end

        set paths (printf '%s\n' $open_list | fzf -m --prompt='Close workspace> ' --height=40% --reverse)
        if test (count $paths) -eq 0
            set_color yellow; echo "[warn] 未选择，取消"; set_color normal
            return 0
        end
    end

    for ws_path in $paths
        test -n "$ws_path"; or continue
        set -l result (
            osascript -e "
                tell application \"Xcode\"
                    set targetPath to \"$ws_path\"
                    repeat with d in (every workspace document)
                        if (path of d) is targetPath then
                            close d
                            return \"Closed\"
                        end if
                    end repeat
                    return \"NotFound\"
                end tell
            " 2>/dev/null
        )
        switch "$result"
            case Closed
                set_color green; printf '==> 已关闭: %s\n' $ws_path; set_color normal
            case NotFound
                set_color yellow; printf '[warn] 未打开，跳过: %s\n' $ws_path; set_color normal
            case '*'
                set_color yellow; echo "[warn] Xcode 未在运行，跳过"; set_color normal
        end
    end
end
