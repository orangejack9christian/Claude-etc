CXX ?= g++
CXXFLAGS ?= -O3 -march=native -std=c++17 -Wall -Wextra -Wno-unused-result
LDFLAGS ?= -pthread

BINS = build/train build/play build/export build/test

all: $(BINS) viewer/engine.wasm

# The search engine for the browser, compiled freestanding (no libc) to WebAssembly.
viewer/engine.wasm: wasm/engine.cpp src/game.h src/search.h src/sparse.h
	clang++ --target=wasm32 -O3 -std=c++17 -nostdlib -ffreestanding -fno-exceptions -fno-rtti -mbulk-memory \
	  -Wl,--no-entry -Wl,--initial-memory=33554432 -Wl,--max-memory=2147483648 -Wl,--strip-all -o $@ $<

build/%: src/%.cpp src/game.h src/ntuple.h src/record.h src/search.h src/sparse.h
	@mkdir -p build
	$(CXX) $(CXXFLAGS) -o $@ $< $(LDFLAGS)

test: build/test
	./build/test

clean:
	rm -rf build

.PHONY: all test clean
