# Commands to run in interactive sessions can go here
if status is-interactive
    printf '\033[6 q'
end

set fish_greeting

set PATH $(brew --prefix)/opt/fzf/bin $(brew --prefix)/bin $HOME/bin $HOME/.emacs.d/bin $(brew --prefix)/opt/coreutils/libexec/gnubin/ /usr/local/bin /usr/bin /bin /usr/sbin /sbin $HOME/.local/bin $HOME/fvm/default/bin $HOME/.rvm/bin $PATH
set FLUTTER_STORAGE_BASE_URL https://storage.flutter-io.cn
set PUB_HOSTED_URL https://pub.dev
#pyenv init - | source
starship init fish | source

alias cp='rsync -avh --progress --stats'
alias scpr='rsync -P --rsh=ssh'
alias l='/bin/ls -F -G'
alias ls='/bin/ls -F -G'
alias lsd='l -d *(-/DN)'
alias ll='l -l'
alias la='l -A'
alias lla='ll -A'
alias llh='ll -h'
alias md='mkdir -p'
alias j='z'
alias jj='z -I'
alias zb='z -b'
alias py='python3'
alias py2='python2'
alias py3='python3'
alias psa='ps aux'
alias psg='psa | ag'
alias pk='pkill'
alias pk9='pkill -9'
alias wi='which'
alias gs='git status'
alias ga='git add'
alias gcm='git commit -m'
alias gp='git push'
alias gc='git clone --depth 1'
alias pipi='pip install --user -i https://pypi.douban.com/simple/'
#alias ssh='ssh -o ServerAliveInterval=60'

set EDITOR nvim
set PAGER 'less -irf'
set GREP_COLOR '40;33;01'
set LANG en_US.UTF-8
set LC_CTYPE en_US.UTF-8

set FZF_DEFAULT_COMMAND 'fd --type file'
set FZF_CTRL_T_COMMAND "$FZF_DEFAULT_COMMAND"

# private config
[ -f $Home/.config/fish/private.fish] && source $HOME/.config/fish/private.fish

[ -f $HOME/.config/fish/z.lua/z.lua ] && source (lua $HOME/.config/fish/z.lua/z.lua --init fish fzf | psub)
alias d="z -I"

if not command -s rbenv > /dev/null
    echo "rbenv: command not found. See https://github.com/rbenv/rbenv"
    exit 1
end

set -l rbenv_root ''
if test -z "$RBENV_ROOT"
    set rbenv_root "$HOME/.rbenv"
    set -x RBENV_ROOT "$HOME/.rbenv"
else
    set rbenv_root "$RBENV_ROOT"
end

set -x PATH $rbenv_root/shims $PATH
set -x RBENV_SHELL fish
if test ! -d "$rbenv_root/shims"; or test ! -d "$rbenv_root/versions"
    command mkdir -p $rbenv_root/{shims,versions}
end

# Some of the most useful features in emacs-libvterm require shell-side
# configurations. The main goal of these additional functions is to enable the
# shell to send information to `vterm` via properly escaped sequences. A
# function that helps in this task, `vterm_printf`, is defined below.

function vterm_printf;
    if begin; [  -n "$TMUX" ]  ; and  string match -q -r "screen|tmux" "$TERM"; end
        # tell tmux to pass the escape sequences through
        printf "\ePtmux;\e\e]%s\007\e\\" "$argv"
    else if string match -q -- "screen*" "$TERM"
        # GNU screen (screen, screen-256color, screen-256color-bce)
        printf "\eP\e]%s\007\e\\" "$argv"
    else
        printf "\e]%s\e\\" "$argv"
    end
end

# Completely clear the buffer. With this, everything that is not on screen
# is erased.
if [ "$INSIDE_EMACS" = 'vterm' ]
    function clear
        vterm_printf "51;Evterm-clear-scrollback";
        tput clear;
    end
end

# This is to change the title of the buffer based on information provided by the
# shell. See, http://tldp.org/HOWTO/Xterm-Title-4.html, for the meaning of the
# various symbols.
function fish_title
    hostname
    echo ":"
    pwd
end

# With vterm_cmd you can execute Emacs commands directly from the shell.
# For example, vterm_cmd message "HI" will print "HI".
# To enable new commands, you have to customize Emacs's variable
# vterm-eval-cmds.
function vterm_cmd --description 'Run an Emacs command among the ones defined in vterm-eval-cmds.'
    set -l vterm_elisp ()
    for arg in $argv
        set -a vterm_elisp (printf '"%s" ' (string replace -a -r '([\\\\"])' '\\\\\\\\$1' $arg))
    end
    vterm_printf '51;E'(string join '' $vterm_elisp)
end

# Sync directory and host in the shell with Emacs's current directory.
# You may need to manually specify the hostname instead of $(hostname) in case
# $(hostname) does not return the correct string to connect to the server.
#
# The escape sequence "51;A" has also the role of identifying the end of the
# prompt
function vterm_prompt_end;
    vterm_printf '51;A'(whoami)'@'(hostname)':'(pwd)
end

# We are going to add a portion to the prompt, so we copy the old one
functions --copy fish_prompt vterm_old_fish_prompt

function fish_prompt --description 'Write out the prompt; do not replace this. Instead, put this at end of your file.'
    # Remove the trailing newline from the original prompt. This is done
    # using the string builtin from fish, but to make sure any escape codes
    # are correctly interpreted, use %b for printf.
    printf "%b" (string join "\n" (vterm_old_fish_prompt))
    vterm_prompt_end
end


function f
    set -q argv[1]; or set argv[1] "."
    vterm_cmd +my/smart-vterm-find-file (realpath "$argv")
end
