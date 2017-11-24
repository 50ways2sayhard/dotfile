#local start_time=$(date "+%s.%N")
# theFuck
eval $(thefuck --alias)

# alias
alias py="/usr/bin/python3"
alias go="/usr/local/var/homebrew/linked/go/bin/go"
alias ll="ls -a -l"

GEOMETRY_PROMPT_PLUGINS=(virtualenv git hg exec_time)


#{{{ 命令提示符、标题栏、任务栏样式
precmd() {
    PROMPT=$(echo "%(?..[%?]:)$CYAN%~\n$GREEN>$FINISH ")

    # 清空上次显示的命令
    case $TERM in
        (screen*)
        print -Pn "\ek%30< ..<%~%<<\e\\"
        ;;
    esac
}

case $TERM in
    (screen*)
    preexec() {
        [ "${1/ */}" = "echo" -o "${1/ */}" = "printf" ] && return
        print -Pn "\ek%30>..>$1%< <\e\\"
    }
    ;;

    (xterm*)
    preexec() {
        [ "${1/ */}" = "echo" -o "${1/ */}" = "printf" ] && return
        print -Pn "\e]0;%~$ ${1//\\/\\\\}\a"
    }
    ;;
esac
#}}}

#{{{ color
autoload colors zsh/terminfo
if [[ "$terminfo[colors]" -ge 8 ]]; then
colors
fi

for color in RED GREEN YELLOW BLUE MAGENTA CYAN WHITE; do
eval _$color='%{$terminfo[bold]$fg[${(L)color}]%}'
eval $color='%{$fg[${(L)color}]%}'
(( count = $count + 1 ))
done
FINISH="%{$terminfo[sgr0]%}"
#}}}

os=`uname -o`
source $HOME/.myshrc
source ~/.zshplug/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
source ~/.zshplug/zsh-history-substring-search/zsh-history-substring-search.zsh
if [ $os='GNU/Linux' ]
then
    source /usr/share/autojump/autojump.zsh
else
    source /usr/local/share/autojump/autojump.zsh
fi
source ~/.zshplug/zsh-autosuggestions/zsh-autosuggestions.zsh
source ~/.zshplug/geometry/geometry.zsh

#{{{ 关于历史纪录的配置
#历史纪录条目数量
export HISTSIZE=100000000
#注销后保存的历史纪录条目数量
export SAVEHIST=100000000
#历史纪录文件
export HISTFILE=~/.zhistory
#分享历史纪录
setopt SHARE_HISTORY
#如果连续输入的命令相同，历史纪录中只保留一个
setopt HIST_IGNORE_DUPS
#为历史纪录中的命令添加时间戳
setopt EXTENDED_HISTORY
#启用 cd 命令的历史纪录，cd -[TAB]进入历史路径
setopt AUTO_PUSHD
#相同的历史路径只保留一个
setopt PUSHD_IGNORE_DUPS
#在命令前添加空格，不将此命令添加到纪录文件中
setopt HIST_IGNORE_SPACE
unsetopt beep
#}}}

#{{{ 杂项

# 扩展路径
# /v/c/p/p => /var/cache/pacman/pkg
setopt complete_in_word

# 禁用 core dumps
#limit coredumpsize 0

bindkey -v
bindkey "\e[1~"   beginning-of-line
bindkey "\e[2~"   insert-last-word
bindkey "\e[3~"   delete-char
bindkey "\e[4~"   end-of-line
bindkey "\e[5~"   backward-word
bindkey "\e[6~"   forward-word
bindkey "\e[7~"   beginning-of-line
bindkey "\e[8~"   end-of-line
bindkey "\e[A"    up-line-or-search
bindkey "\e[B"    down-line-or-search
bindkey "\e[C"    forward-char
bindkey "\e[D"    backward-char
bindkey "\eOH"    beginning-of-line
bindkey "\eOF"    end-of-line
bindkey "\e[H"    beginning-of-line
bindkey "\e[F"    end-of-line

bindkey "^p"      up-line-or-search
bindkey "^n"      down-line-or-search
bindkey "^r"      history-incremental-search-backward
bindkey "^a"      beginning-of-line
bindkey "^e"      end-of-line
bindkey "^f"      forward-char
bindkey "^b"      backward-char
bindkey "^[f"     forward-word
bindkey "^[b"     backward-word
bindkey "^x^x"    exchange-point-and-mark
bindkey "^k"      kill-line
bindkey "^o"      accept-line-and-down-history

#以下字符视为单词的一部分
WORDCHARS='*?_-[]~=&;!#$%^(){}<>'
#}}}

#{{{ 自动补全功能
setopt AUTO_LIST
setopt AUTO_MENU
# 开启此选项，补全时会直接选中菜单项
# setopt MENU_COMPLETE
autoload -U compinit
compinit

_force_rehash() {
    (( CURRENT == 1 )) && rehash
    return 1    # Because we didn't really complete anything
}
zstyle ':completion:::::' completer _force_rehash _complete _approximate

# 自动补全选项
zstyle ':completion:*' verbose yes
zstyle ':completion:*' menu select
zstyle ':completion:*:*:default' force-list always
zstyle ':completion:*' select-prompt '%SSelect:  lines: %L  matches: %M  [%p]'
zstyle ':completion:*:match:*' original only
zstyle ':completion::prefix-1:*' completer _complete
zstyle ':completion:predict:*' completer _complete
zstyle ':completion:incremental:*' completer _complete _correct
zstyle ':completion:*' completer _complete _prefix _correct _prefix _match _approximate

# 路径补全
zstyle ':completion:*' expand 'yes'
zstyle ':completion:*' squeeze-slashes 'yes'
zstyle ':completion::complete:*' '\\'

# 彩色补全菜单
export ZLSCOLORS="${LS_COLORS}"
zmodload zsh/complist
zstyle ':completion:*' list-colors ${(s.:.)LS_COLORS}

# 修正大小写
zstyle ':completion:*' matcher-list '' 'm:{a-zA-Z}={A-Za-z}'

# 错误校正
zstyle ':completion:*' completer _complete _match _approximate
zstyle ':completion:*:match:*' original only
zstyle ':completion:*:approximate:*' max-errors 1 numeric

# 补全类型提示分组
zstyle ':completion:*:matches' group 'yes'
zstyle ':completion:*' group-name ''
zstyle ':completion:*:options' description 'yes'
zstyle ':completion:*:options' auto-description '%d'
zstyle ':completion:*:descriptions' format $'\e[01;33m -- %d --\e[0m'
zstyle ':completion:*:messages' format $'\e[01;35m -- %d --\e[0m'
zstyle ':completion:*:warnings' format $'\e[01;31m -- No Matches Found --\e[0m'
zstyle ':completion:*:corrections' format $'\e[01;32m -- %d (errors: %e) --\e[0m'

# kill 补全
zstyle ':completion:*:*:kill:*:processes' list-colors '=(#b) #([0-9]#)*=0=01;31'
zstyle ':completion:*:*:kill:*' menu yes select
zstyle ':completion:*:*:*:*:processes' force-list always
zstyle ':completion:*:processes' command 'ps -au$USER'

# cd ~ 补全顺序
zstyle ':completion:*:-tilde-:*' group-order 'named-directories' 'path-directories' 'users' 'expand'

# 空行(光标在行首)补全 "cd "
user-complete() {
    case $BUFFER in
        "" )
            # 空行填入 "cd "
            BUFFER="cd "
            zle end-of-line
            zle expand-or-complete
            ;;

        " " )
            BUFFER="!?"
            zle end-of-line
            zle expand-or-complete
            ;;

        * )
            zle expand-or-complete
            ;;
    esac
}

#
# jj() {
#   pushd "$(fasd -Rdl | head -n -7 | tac | awk '{print $2}' |fzf +s)"
# }

jj() {
    local dir
    dir=$(autojump -s |\
        head -n -7 |\
        tac |\
        awk '{print $2}' |\
        sed "s:$HOME:~:" |\
        fzf --no-sort +m -q "$*" |\
        sed "s:~:$HOME:")\
    && pushd "$dir" && clear
}


zle -N user-complete
bindkey "\t" user-complete
##}}}

# {{{ 在命令前插入 sudo
#sudo-command-line() {
#    [[ -z $BUFFER ]] && zle up-history
#    [[ $BUFFER != sudo\ * ]] && BUFFER="sudo $BUFFER"
#    #光标移动到行末
#    zle end-of-line
#}
#
#zle -N sudo-command-line
#bindkey '^[j' sudo-command-line
#}}}

#{{{
autoload edit-command-line
zle -N edit-command-line
bindkey '^g' edit-command-line
#}}}

#echo $(( $(date "+%s.%N") - start_time))

[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh

export PATH=$PATH:"/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/X11/bin:/usr/local/mysql/bin"
export COCOS_CONSOLE_ROOT=/Library/WebServer/Documents/cocos2d-js-v3.6/tools/cocos2d-console/bin
export PATH=$COCOS_CONSOLE_ROOT:$PATH
PATH=$PATH:/opt/pkg_uninstaller
if which rbenv > /dev/null; then eval "$(rbenv init -)"; fi
