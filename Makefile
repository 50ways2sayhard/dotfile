STOW := stow
HOME := $(HOME)
GLN := gln

# 普通 packages → stow -t ~
NORMAL_PKGS := zsh tmux

# dotfiles packages → stow --dotfiles -t ~
DOTFILE_PKGS := dot-config

# 特殊处理
SPECIAL_PKGS := rime

ALL_PKGS := $(NORMAL_PKGS) $(DOTFILE_PKGS) $(SPECIAL_PKGS)

.PHONY: all install uninstall $(ALL_PKGS)

all:
	@echo "Usage: make <package> | make install"
	@echo "Normal: $(NORMAL_PKGS)"
	@echo "Dotfile: $(DOTFILE_PKGS)"
	@echo "Special: $(SPECIAL_PKGS)"

install: $(ALL_PKGS)

uninstall:
	$(STOW) -t $(HOME) -D $(NORMAL_PKGS)
	$(STOW) --dotfiles -t $(HOME) -D $(DOTFILE_PKGS)
	@echo "rime needs manual cleanup"

$(NORMAL_PKGS):
	$(STOW) -t $(HOME) $@

$(DOTFILE_PKGS):
	$(STOW) --dotfiles -t $(HOME) $@

rime:
	@mkdir -p $(HOME)/Library/Rime $(HOME)/.config/rime
	$(GLN) -srf rime/Rime/* $(HOME)/Library/Rime/
	$(GLN) -srf rime/Rime/* $(HOME)/.config/rime/
	@echo "Remember to set installation.yaml"
