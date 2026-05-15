#!/bin/bash

signal_file="${XDG_RUNTIME_DIR:-/tmp}/ags-launcher-toggle"
date +%s%N > "$signal_file"
