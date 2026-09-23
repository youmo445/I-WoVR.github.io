# I-WoVR

Project website for **I-WoVR: VLA-Interface-Aligned World Models for Reliable Closed-Loop Reinforcement Learning**.

This repository contains the current static project-page draft, including real-robot demonstrations, the framework and methodology, and experimental results. Abstract and citation information are still placeholders.

## Preview

Serve the repository root with any static HTTP server. No package installation or build step is required.

All asset paths are relative, so the site supports GitHub Pages project URLs. Videos play at a fixed 2x rate. The six-task success charts and phone-packaging results are rendered natively in the browser.

The same-action GT / I-WoVR world-model replay section follows Abstract. It contains 20 uncaptioned comparison videos: RoboTwin Random (the default group), RoboTwin Clean, six real-world tasks, and four phone-packaging stages. Each pair shows GT on the left and world-model replay on the right, with head and two wrist views arranged vertically.

## GitHub Pages

In **Settings > Pages**, choose **Deploy from a branch**, then select **main** and **/(root)**. The `.nojekyll` file serves the static site without a Jekyll build.

The expected project URL after enabling Pages is:

https://youmo445.github.io/I-WoVR.github.io/

## Attribution

Website styling is adapted from [RISE](https://opendrivelab.com/RISE/) by OpenDriveLab. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for source information. Third-party styling is not relicensed by this repository.

Only the website and its referenced media are included. Raw recordings, source manuscripts, private provenance records, and development workspace files are excluded.
