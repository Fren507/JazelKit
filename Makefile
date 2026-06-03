# Variables
PROJECTROOT := $(shell git rev-parse --show-toplevel)

# Macros
to-md = pandoc -f rst -t gfm $(1) -o $(2)

# Declare all command-only targets as PHONY
.PHONY: migrate-docs make-rst-docs make-md-docs commit pull

migrate-docs:
	@if [ ! -f $(PROJECTROOT)/README.rst ]; then \
		$(MAKE) make-rst-docs; \
	elif [ ! -f $(PROJECTROOT)/README.md ]; then \
		$(MAKE) make-md-docs; \
	elif [ $(PROJECTROOT)/README.md -nt $(PROJECTROOT)/README.rst ]; then \
		$(MAKE) make-rst-docs; \
	else \
		$(MAKE) make-md-docs; \
	fi

make-rst-docs:
	pandoc $(PROJECTROOT)/README.md -t rst -o $(PROJECTROOT)/README.rst

make-md-docs:
	$(call to-md,$(PROJECTROOT)/README.rst,$(PROJECTROOT)/README.md)

commit:
	$(MAKE) migrate-docs
	# Add README.txt from README.rst (Fixed variable syntax here)
	cat $(PROJECTROOT)/README.rst | \
		fold -sw 75 | \
		pr -h "README" -n -w 80 \
		> $(PROJECTROOT)/README.txt
	git add -A
	git commit

pull:
	@echo 'Done!'
