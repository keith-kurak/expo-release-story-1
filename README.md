# Expo Demo Stores

Some small stories from the field about using various parts of EAS

## OTA Updates

### 1. EAS Workflows / Release branch automation / release to multiple versions

Let's suppose that we do trunk-based development and we release based on tagging commits. We'll tag releases in the format "release-1.2.0".

To semantically differentiate native builds from updates, we'll use patch version:

- 1.2.0 - native version / app store build
- 1.2.1 - OTA update

Thus, our runtime version will be x.y.0. An update must only change the patch number to be compatible.

#### On binary/store release

1. tag `release-x.y.0`
2. **production-build.yaml** workflow will run, creating/submitting builds to stores
3. create `build-x.y.0` branch, this will be the workspace for cherry-picking commits for future updates

#### On update

1. Cherry pick desired commits to `build-x.y.0` branch
2. **check-native-build.yaml** will run, confirm that new JS is still runtime-compatible
3. Tag `release-x.y.1` (or higher)
4. **ota-update.yaml** will run, publishing OTA update (after one more runtime check)
5. Repeat for any other builds that should be updated.

### 2. Normal vs critical updates

_The critical updates pattern is shown in this example: https://github.com/expo/UpdatesAPIDemo_

We'll use a critical index to indicate if there is at least one critical update between the current update the user is running and the next update. Then we'll change the client side behavior to force the update immediately when the update is critical.

1. On the `build-x.y.0` branch where you're cherry-picking updates, increment the critical index.
2. Tag `release.x.y.z` to trigger **ota-update.yaml**
3. The published update will be critical.

#### 3. Updating multiple apps at once

While EAS Workflows are typically bound to a single project, if you have a single codebase that generates multiple project (e.g., a white label or multi-brand scenario), then you can chain updates for multiple platforms together using custom jobs, which can run any EAS CLI command. So, in this setup, you might have a parent project that takes actions on behalf of the child projects.

1. Run `eas workflow:run .eas/workflows/ota-update-all-brands.yaml -F version=1.1.0`

If multiple brands are separate projects in a monorepo, or even just have diffrent file paths, that opens up opportunities to use Github events directly against each project individually.

## Observe

### 1. Observation essentials

- The base configuration offers us cold start, warm start, and bundle load time
- Some additional entry point configuration adds time-to-interactive and time-to-first-render
- Turning on the Expo Router integration allows for per-route metrics
- Custom events can also be added.

### 2. Data aggregation

1. `eas metrics` commands allow for programmatic ingestion of the data that appears on the Observe dashboard.

2. Can combine these calls from multiple apps to create aggregate data view for multiple apps.

For a huge number of apps, raw events could be ingested directly by overriding the endpoint (OTEL format), still get Observe dashboard features if you forward them along.

#### Example

Run `./scripts/collect-metrics.sh` to output a csv of consolidated metrics for two apps.

## 3. Development builds

Development builds can allow developer to minimize the number of builds they need to run in order to do local development and allow testers to install one build to test many different changes. This is because development builds can run JavaScript code from a local bundler URL or an OTA update URL.

1. Commit to a branch and open a PR against that branch.
2. The **pr-preview.yaml** workflow will run
3. If needed, development builds that are compatible with the PR will be built
4. An update will be published to a branch matching the PR number
5. A QR code to the update will be output, along with links to the compatible development builds

#### Updating iOS device builds will new device UDID's

iOS development builds can use internal distribution (aka ad-hoc distribution) to go to developer or tester devices without Testflight. The app will need to be rebuilt when devices are added to it. EAS provides a streamlined QR code for adding devices.

1. Run `eas device:create` and choose the "website" option to show the QR code/ link
2. Provide this link to team members.
3. They'll scan it to install the needed network profile and register their UDID with EAS.
4. On the next build, that UDID will be included in the provisioning profile.

In workflows, the `refresh_ad_hoc_provisioning_profile` property can be used to automatically add any new devices on the next build.
