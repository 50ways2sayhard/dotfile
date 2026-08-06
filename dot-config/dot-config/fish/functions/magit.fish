function magit --description 'Open magit and focus Emacs'
    # Determine the target path: first argument if given; else read stdin if
    # piped; otherwise current directory
    set -l target_path $PWD
    if test (count $argv) -gt 0
        set target_path $argv[1]
        set -e argv[1]
    else if not isatty stdin
        read -l line
        if test -n "$line"
            set target_path $line
        end
    end

    # Resolve to an absolute path and verify it exists
    if not test -e "$target_path"
        echo "magit: path does not exist: $target_path" >&2
        return 1
    end

    # If target is a file, use its containing directory
    if test -f "$target_path"
        set target_path (dirname "$target_path")
    end

    # Get the root of the git repository from the target path
    set -l git_root (git -C "$target_path" rev-parse --show-toplevel 2>/dev/null)
    if test -z "$git_root"
        echo "magit: not inside a git repository: $target_path" >&2
        return 1
    end

    # Open magit-status in Emacs
    emacsclient -e "(magit-status \"$git_root\")" >/dev/null

    # Bring Emacs frame to the foreground (macOS specific)
    if test (uname) = Darwin
        osascript -e 'tell application "System Events" to tell application process "Emacs" to set frontmost to true' >/dev/null
    end

    # Pass any additional arguments to emacsclient
    # https://dolzhenko.me/blog/2025/03/launching-magit-from-intellij-idea/
    # if test (count $argv) -gt 0
    #     emacsclient $argv
    # end
end
