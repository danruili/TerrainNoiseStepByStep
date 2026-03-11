# TerrianNoiseStepByStep

Static interactive slides for teaching Perlin noise and fractal Brownian motion (fBM) in the browser.

## Overview

This project presents a 9-slide walkthrough that starts with naive random noise and builds up to:

- Perlin gradient assignment and dot products
- Horizontal and vertical interpolation inside a lattice cell
- Frequency scaling
- fBM octave stacking
- Different amplitude decay rules
- Seamless tiling with wrapped gradient lookup
- A comparison between Perlin-based fBM and sin-based layered noise

The demo is implemented as a plain HTML/CSS/JavaScript site. There is no build step and no external framework dependency.

## Run Locally

Because this is a static site, you can open it directly in a browser.


## Controls

- Use `Previous` and `Next` to move between slides
- Use left/right arrow keys for keyboard navigation
- Hover interactive visualizations to inspect values and interpolation steps
- Change the seed on slide 1 to regenerate the gradient lattice and all derived views

## Notes

- The seed is deterministic, so the same input reproduces the same gradient field.
- The Perlin examples use a small lattice for teaching clarity rather than production-scale terrain generation.
