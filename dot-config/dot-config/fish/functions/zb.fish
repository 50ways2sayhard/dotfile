function zb --description 'Jump backward through parent directories'
    set -l interactive 0
    set -l parse_options 1
    set -l positional

    for arg in $argv
        if test $parse_options -eq 1
            switch "$arg"
                case --
                    set parse_options 0
                    continue
                case -i
                    set interactive 1
                    continue
                case -I
                    set interactive 2
                    continue
                case -b
                    continue
            end
        end
        set -a positional "$arg"
    end

    set -l argument_count (count $positional)
    if test $argument_count -gt 2
        printf 'zb: takes at most 2 arguments\n' >&2
        return 1
    end

    set -l target

    if test $argument_count -eq 0
        if test $interactive -gt 0
            set -l breadcrumb_paths
            set -l breadcrumb_names
            set -l candidate (path dirname -- "$PWD")

            while true
                if test "$candidate" = /
                    set -a breadcrumb_paths "$candidate"
                    set -a breadcrumb_names /
                    break
                end

                set -l name (path basename -- "$candidate")
                if test -z "$name"
                    break
                end
                set -a breadcrumb_paths "$candidate"
                set -a breadcrumb_names "$name"

                set -l parent (path dirname -- "$candidate")
                if test "$parent" = "$candidate"
                    break
                end
                set candidate "$parent"
            end

            set -l breadcrumb_count (count $breadcrumb_paths)
            set -l selection
            if test $interactive -eq 1
                set -l index $breadcrumb_count
                while test $index -ge 1
                    printf '%d: %s\n' "$index" "$breadcrumb_names[$index]" >&2
                    set index (math "$index - 1")
                end
                printf '> ' >&2
                read selection
            else
                if not command -q fzf
                    printf 'zb: fzf is required for -I\n' >&2
                    return 1
                end

                set -l choices
                set -l index $breadcrumb_count
                while test $index -ge 1
                    set -a choices "$index: $breadcrumb_names[$index]"
                    set index (math "$index - 1")
                end
                set -l selected (printf '%s\n' $choices | fzf --reverse --info=inline --tac)
                set selection (string split -m 1 ':' -- "$selected")[1]
            end

            set selection (string trim -- "$selection")
            if not string match -q -r -- '^[0-9]+$' "$selection"
                return 1
            end
            if test "$selection" -lt 1; or test "$selection" -gt "$breadcrumb_count"
                return 1
            end
            set target "$breadcrumb_paths[$selection]"
        else
            set -l markers .git .svn .hg
            if set -q _ZL_ROOT_MARKERS; and test -n "$_ZL_ROOT_MARKERS"
                set markers (string split ',' -- "$_ZL_ROOT_MARKERS")
            end

            set -l candidate "$PWD"
            while true
                for marker in $markers
                    if test -e "$candidate/$marker"
                        set target "$candidate"
                        break
                    end
                end
                if test -n "$target"
                    break
                end

                set -l parent (path dirname -- "$candidate")
                if test "$parent" = "$candidate"
                    break
                end
                set candidate "$parent"
            end
        end
    else if test $argument_count -eq 1
        set -l key "$positional[1]"
        if test -z "$key"
            return 1
        end

        if string match -q -r -- '^\.\.+$' "$key"
            set -l levels (string length -- "$key")
            set levels (math "$levels - 1")
            set target "$PWD"
            while test "$levels" -gt 0
                set target (path dirname -- "$target")
                set levels (math "$levels - 1")
            end
        else if string match -q -r -- '^\.\.[0-9]+$' "$key"
            set -l levels (string replace --regex '^\.\.' '' -- "$key")
            set target "$PWD"
            while test "$levels" -gt 0
                set target (path dirname -- "$target")
                set levels (math "$levels - 1")
            end
        else
            set -l key_lower (string lower -- "$key")
            set -l case_insensitive 0
            if test "$key_lower" = "$key"
                set case_insensitive 1
            end

            set -l contains_target
            set -l candidate (path dirname -- "$PWD")
            while true
                set -l name (path basename -- "$candidate")
                set -l compare_name "$name"
                set -l compare_key "$key"
                if test $case_insensitive -eq 1
                    set compare_name (string lower -- "$name")
                    set compare_key "$key_lower"
                end

                set -l prefix (string sub --length (string length -- "$compare_key") -- "$compare_name")
                if test "$prefix" = "$compare_key"
                    set target "$candidate"
                    break
                end
                if test -z "$contains_target"
                    if string replace -- "$compare_key" '' "$compare_name" >/dev/null
                        set contains_target "$candidate"
                    end
                end

                set -l parent (path dirname -- "$candidate")
                if test "$parent" = "$candidate"
                    break
                end
                set candidate "$parent"
            end
            if test -z "$target"; and test -n "$contains_target"
                set target "$contains_target"
            end
        end
    else
        set -l source "$positional[1]"
        set -l replacement "$positional[2]"
        if test -z "$source"
            return 1
        end

        set -l parts (string split -- "$source" "$PWD")
        set -l part_count (count $parts)
        if test $part_count -gt 1
            set -l prefix "$parts[1]"
            set -l index 2
            while test $index -lt $part_count
                set prefix "$prefix$source$parts[$index]"
                set index (math "$index + 1")
            end
            set target "$prefix$replacement$parts[$part_count]"
        else
            set target "$PWD"
        end
    end

    if test -z "$target"
        return 1
    end
    # Keep `(zb ...)` from changing the caller's directory.
    if status is-command-substitution
        if set -q _ZL_ECHO; and test -n "$_ZL_ECHO"
            printf '%s\n' "$target"
        end
        return 0
    end
    if not cd -- "$target"
        return 1
    end
    if set -q _ZL_ECHO; and test -n "$_ZL_ECHO"
        pwd
    end
end
