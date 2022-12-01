#! /bin/bash

special_conf=("fish" "Rime")

function fish_install() {
    cd fish/.config/fish/
    gln -sr * ~/.config/fish/
}

function Rime_install() {
    mkdir ~/Library/Rime
    mkdir ~/.config/rime
    cd ~/dotfile/rime/Rime
    gln -sr * ~/Library/Rime/
    gln -sr * ~/.config/rime/
    echo "Remember to set the installation.yaml"
}

if [[ "${special_conf[@]}" =~ "${1}" ]]; then
    $1_install
else
    stow $1 -t ~/
fi
