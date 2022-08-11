![Visual Programming for Zig with NuttX Sensors](https://lupyuen.github.io/images/sensor-visual.jpg)

# Visual Programming for Zig with NuttX Sensors

Read the articles...

-   ["Zig Visual Programming with Blockly"](https://lupyuen.github.io/articles/blockly)

-   ["Read NuttX Sensor Data with Zig"](https://lupyuen.github.io/articles/sensor)

Try the Work-in-Progress Demo...

-   [lupyuen3.github.io/blockly-zig-nuttx/demos/code](https://lupyuen3.github.io/blockly-zig-nuttx/demos/code/)

Can we use Scratch / [Blockly](https://github.com/google/blockly) to code Zig programs, the drag-n-drop way?

Let's create a Visual Programming Tool for Zig that will generate IoT Sensor Apps with Apache NuttX RTOS.

_Why limit to IoT Sensor Apps?_

-   Types are simpler: Only floating-point numbers will be supported, no strings needed

-   Blockly is Typeless. With Zig we can use Type Inference to deduce the missing types

-   Make it easier to experiment with various IoT Sensors: Temperature, Humidity, Air Pressure, ...

Let's customise Blockly to generate Zig code...

![Visual Programming for Zig with Blockly](https://lupyuen.github.io/images/blockly-title.jpg)

[(Source)](https://lupyuen3.github.io/blockly-zig-nuttx/demos/code/)

# Add a Zig Tab

Blockly is bundled with a list of Demos...

[lupyuen3.github.io/blockly-zig-nuttx/demos](https://lupyuen3.github.io/blockly-zig-nuttx/demos/)

There's a Code Generation Demo that shows the code generated by Blockly for JavaScript, Python, Dart, ...

[lupyuen3.github.io/blockly-zig-nuttx/demos/code](https://lupyuen3.github.io/blockly-zig-nuttx/demos/code/)

Let's add a tab that will show the Zig code generated by Blockly: [demos/code/index.html](demos/code/index.html)

```html
<!--  Inserted this to Load Messages: (Not sure why)  -->
<script src="../../msg/messages.js"></script>
...
<tr id="tabRow" height="1em">
  <td id="tab_blocks" class="tabon">...</td>
  <td class="tabmin tab_collapse">&nbsp;</td>
  <!-- Inserted these two lines: -->
  <td id="tab_zig" class="taboff tab_collapse">Zig</td>
  <td class="tabmin tab_collapse">&nbsp;</td>
...
<div id="content_blocks" class="content"></div>
<!-- Inserted this line: -->
<pre id="content_zig" class="content prettyprint lang-zig"></pre>
```

[(See the changes)](https://github.com/lupyuen3/blockly-zig-nuttx/pull/1/files#diff-dcf2ffe98d7d8b4a0dd7b9f769557dbe8c9e0e726236ef229def25c956a43d8f)

We'll see the Zig Tab like this...

[lupyuen3.github.io/blockly-zig-nuttx/demos/code](https://lupyuen3.github.io/blockly-zig-nuttx/demos/code/)

![Zig Tab in Blockly](https://lupyuen.github.io/images/blockly-run3a.png)

# Zig Code Generator

Blockly comes bundled with Code Generators for JavaScript, Python, Dart, ...

Let's create a Code Generator for Zig, by copying from the Dart Code Generator.

Copy [generators/dart.js](generators/dart.js) to [generators/zig.js](generators/zig.js)

Copy all files from [generators/dart](generators/dart) to [generators/zig](generators/zig)...

```text
all.js
colour.js
lists.js
logic.js
loops.js
math.js
procedures.js
text.js
variables.js  
variables_dynamic.js
```

[(See the copied files)](https://github.com/lupyuen3/blockly-zig-nuttx/commit/ba968942c6ee55937ca554e1d290d8d563fa0b78)

Edit [generators/zig.js](generators/dart.js) and all files in [generators/zig](generators/zig).

Change all `Dart` to `Zig`, preserve case.

[(See the changes)](https://github.com/lupyuen3/blockly-zig-nuttx/commit/efe185d6cac4306dcdc6b6a5f261b331bb992976)

# Load Code Generator

Let's load our Zig Code Generator in Blockly...

Add the Zig Code Generator to [demos/code/index.html](demos/code/index.html)...

```html
<!--  Load Zig Code Generator  -->
<script src="../../zig_compressed.js"></script>
```

[(See the changes)](https://github.com/lupyuen3/blockly-zig-nuttx/pull/1/files#diff-dcf2ffe98d7d8b4a0dd7b9f769557dbe8c9e0e726236ef229def25c956a43d8f)

Enable the Zig Code Generator in [demos/code/code.js](demos/code/code.js)...

```javascript
// Inserted `zig`...
Code.TABS_ = [
  'blocks', 'zig', 'javascript', 'php', 'python', 'dart', 'lua', 'xml', 'json'
];
...
// Inserted `Zig`...
Code.TABS_DISPLAY_ = [
  'Blocks', 'Zig', 'JavaScript', 'PHP', 'Python', 'Dart', 'Lua', 'XML', 'JSON'
];
...
Code.renderContent = function() {
  ...
  } else if (content.id === 'content_json') {
    var jsonTextarea = document.getElementById('content_json');
    jsonTextarea.value = JSON.stringify(
        Blockly.serialization.workspaces.save(Code.workspace), null, 2);
    jsonTextarea.focus();
  // Inserted this...
  } else if (content.id == 'content_zig') {
    Code.attemptCodeGeneration(Blockly.Zig);
```

[(See the changes)](https://github.com/lupyuen3/blockly-zig-nuttx/pull/1/files#diff-d72873b861dee958e5d443c919726dd856de594bd56b1e73d8948a7719163553)

Add our Code Generator to the Build Task: [scripts/gulpfiles/build_tasks.js](scripts/gulpfiles/build_tasks.js#L98-L139)

```javascript
 const chunks = [
   // Added this...
   {
      name: 'zig',
      entry: 'generators/zig/all.js',
      reexport: 'Blockly.Zig',
   }
 ];
```

[(See the changes)](https://github.com/lupyuen3/blockly-zig-nuttx/pull/1/files#diff-a9a5784f43ce15ca76bb3e99eb6625c3ea15381e20eac6f7527ecbcb2945ac14)

Now we compile our Zig Code Generator.

# Build Blockly

Blockly builds fine with Linux, macOS and WSL. (But not plain old Windows CMD)

To build Blockly with the Zig Code Generator...

```bash
git clone --recursive https://github.com/lupyuen3/blockly-zig-nuttx
cd blockly-zig-nuttx
npm install

## Run these steps when we change the Zig Code Generator
npm run build
npm run publish

## When prompted "Is this the correct branch?",
## press N

## Instead of "npm run publish" (which can be slow), we may do this...
## cp build/*compressed* .

## For WSL: We can copy the generated files to c:\blockly-zig-nuttx for testing on Windows
## cp *compressed* /mnt/c/blockly-zig-nuttx
```

This compiles and updates the Zig Code Generator in [zig_compressed.js](zig_compressed.js) and [zig_compressed.js.map](zig_compressed.js.map)

If we're using VSCode, here's the Build Task: [.vscode/tasks.json](.vscode/tasks.json)

# Test Blockly

Browse to `blockly-zig-nuttx/demos/code` with a Local Web Server. [(Like Web Server for Chrome)](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb/)

We should see this...

[lupyuen3.github.io/blockly-zig-nuttx/demos/code](https://lupyuen3.github.io/blockly-zig-nuttx/demos/code/)

![Zig Tab in Blockly](https://lupyuen.github.io/images/blockly-run3a.png)

Blockly will NOT render correctly with `file://...`, it must be `http://localhost:port/...`

Drag-and-drop some Blocks and click the Zig Tab.

The Zig Tab now shows the generated code in Dart (because we copied the Dart Code Generator).

(In case of problems, check the JavaScript Console. Ignore the `storage.js` error)

Now we modify our Code Generator to generate Zig code.

# Set Variable

Let's generate the Zig code for setting a variable...

![Set Variable](https://lupyuen.github.io/images/blockly-run5.png)

For simplicity we'll treat variables as constants...

```zig
const a: f32 = 123.45;
```

This is how we generate the above code in the Zig Code Generator for Blockly (coded in JavaScript): [generators/zig/variables.js](generators/zig/variables.js#L25-L32)

```javascript
Zig['variables_set'] = function(block) {
  // Variable setter.
  ...
  return `const ${varName}: f32 = ${argument0};\n`;
};
```

# Print Expression

To print the value of an expression...

![Print Expression](https://lupyuen.github.io/images/blockly-run6.png)

We'll generate this Zig code...

```zig
debug("a={}", .{ a });
```

Here's how we implement this in the Zig Code Generator for Blockly: [generators/zig/text.js](generators/zig/text.js#L268-L272)

```javascript
Zig['text_print'] = function(block) {
  // Print statement.
  ...
  return `debug("${msg}={}", .{ ${msg} });\n`;
};
```

# Repeat Loop

To run a repeating loop...

![Repeat Loop](https://lupyuen.github.io/images/blockly-run4.png)

We'll generate this Zig code...

```zig
var count: usize = 0;
while (count < 10) : (count += 1) {
  ...
}
```

With this Zig Code Generator in Blockly: [generators/zig/loops.js](generators/zig/loops.js#L19-L45)

```javascript
Zig['controls_repeat_ext'] = function(block) {
  // Repeat n times.
  ...
  code += [
    `var ${loopVar}: usize = 0;\n`,
    `while (${loopVar} < ${endVar}) : (${loopVar} += 1) {\n`,
    branch,
    '}\n'
  ].join('');
  return code;
};
```

_What happens if we have 2 repeat loops? Won't `count` clash?_

Blockly will automatically generate another counter...

```zig
var count2: usize = 0;
while (count2 < 10) : (count2 += 1) {
  ...
}
```

(Try it out!)

# Main Function

The generated Zig code needs to be wrapped like this, to become a valid Zig program...

```zig
/// Import Standard Library
const std = @import("std");

/// Main Function
pub fn main() !void {
  // TODO: Generated Zig Code here
  ...
}

/// Aliases for Standard Library
const assert = std.debug.assert;
const debug  = std.log.debug;
```

We do this in the Zig Code Generator for Blockly: [generators/zig.js](generators/zig.js#L132-L193)

```javascript
Zig.finish = function(code) {
  ...
  // Main Function
  code = [
    '/// Main Function\n',
    'pub fn main() !void {\n',
    code,
    '}',
  ].join('');
 
  // Convert the definitions dictionary into a list.
  ...

  // Compose Zig Header
  const header = [
    '/// Import Standard Library\n',
    'const std = @import("std");\n',
  ].join('');

  // Compose Zig Trailer
  const trailer = [
    '/// Aliases for Standard Library\n',
    'const assert = std.debug.assert;\n',
    'const debug  = std.log.debug;\n',
  ].join('');

  // Combine Header, Definitions, Code and Trailer
  return [
    header,
    '\n',
    // For Zig: No need to declare variables
    // allDefs.replace(/\n\n+/g, '\n\n').replace(/\n*$/, '\n\n\n'),
    code,
    '\n\n',
    trailer,
  ].join('');
};
```

We're ready to test our Zig Code Generator!

# Run the Generated Code

Follow the steps described earlier to build Blockly.

We browse to our local Blockly site...

[lupyuen3.github.io/blockly-zig-nuttx/demos/code](https://lupyuen3.github.io/blockly-zig-nuttx/demos/code/)

Then drag-and-drop the Blocks to create this Visual Program...

![Blockly Visual Program](https://lupyuen.github.io/images/blockly-run1.png)

Click the Zig Tab to see the generated code...

![Zig Code generated by Blocky](https://lupyuen.github.io/images/blockly-run2.png)

Our Code Generator in Blockly generates this Zig code...

```zig
/// Import Standard Library
const std = @import("std");

/// Main Function
pub fn main() !void {
  var count: usize = 0;
  while (count < 10) : (count += 1) {
    const a: f32 = 123.45;
    debug("a={}", .{ a });
  }
}

/// Aliases for Standard Library
const assert = std.debug.assert;
const debug  = std.log.debug;
```

Which runs perfectly OK with Zig! 🎉

```bash
$ zig run a.zig
debug: a=1.23449996e+02
debug: a=1.23449996e+02
debug: a=1.23449996e+02
debug: a=1.23449996e+02
debug: a=1.23449996e+02
debug: a=1.23449996e+02
debug: a=1.23449996e+02
debug: a=1.23449996e+02
debug: a=1.23449996e+02
debug: a=1.23449996e+02
```

# Blockly on Mobile

Blockly works OK with Mobile Web Browsers too...

[lupyuen3.github.io/blockly-zig-nuttx/demos/code](https://lupyuen3.github.io/blockly-zig-nuttx/demos/code/)

![Blocky on Mobile Web Browser](https://lupyuen.github.io/images/blockly-mobile.jpg)

# Custom Block

TODO

![BME280 Sensor Block](https://lupyuen.github.io/images/visual-block1.jpg)

TODO

```zig
const temperature = try sen.readSensor(  // Read BME280 Sensor
  c.struct_sensor_baro,       // Sensor Data Struct
  "temperature",              // Sensor Data Field
  "/dev/sensor/sensor_baro0"  // Path of Sensor Device
);
debug("temperature={}", .{ temperature });
```

# Create Custom Block

TODO

![Create Custom Block](https://lupyuen.github.io/images/visual-block3.jpg)

Download Block Library XML

# Export Custom Block

TODO

![Export Custom Block](https://lupyuen.github.io/images/visual-block4.jpg)

# Load Custom Block

TODO

# Code Generator for Custom Block

TODO

# Test Custom Block

TODO

# Blockly [![Build Status]( https://travis-ci.org/google/blockly.svg?branch=master)](https://travis-ci.org/google/blockly)

Google's Blockly is a library that adds a visual code editor to web and mobile apps. The Blockly editor uses interlocking, graphical blocks to represent code concepts like variables, logical expressions, loops, and more. It allows users to apply programming principles without having to worry about syntax or the intimidation of a blinking cursor on the command line.  All code is free and open source.

![](https://developers.google.com/blockly/images/sample.png)

## Getting Started with Blockly

Blockly has many resources for learning how to use the library. Start at our [Google Developers Site](https://developers.google.com/blockly) to read the documentation on how to get started, configure Blockly, and integrate it into your application. The developers site also contains links to:

* [Getting Started article](https://developers.google.com/blockly/guides/get-started/web)
* [Getting Started codelab](https://blocklycodelabs.dev/codelabs/getting-started/index.html#0)
* [More codelabs](https://blocklycodelabs.dev/)
* [Demos and plugins](https://google.github.io/blockly-samples/)

Help us focus our development efforts by telling us [what you are doing with
Blockly](https://developers.google.com/blockly/registration).  The questionnaire only takes
a few minutes and will help us better support the Blockly community.

### Installing Blockly

Blockly is [available on npm](https://www.npmjs.com/package/blockly).

```bash
npm install blockly
```

For more information on installing and using Blockly, see the [Getting Started article](https://developers.google.com/blockly/guides/get-started/web).

### Getting Help
* [Report a bug](https://developers.google.com/blockly/guides/modify/contribute/write_a_good_issue) or file a feature request on GitHub
* Ask a question, or search others' questions, on our [developer forum](https://groups.google.com/forum/#!forum/blockly). You can also drop by to say hello and show us your prototypes; collectively we have a lot of experience and can offer hints which will save you time. We actively monitor the forums and typically respond to questions within 2 working days.

### blockly-samples

We have a number of resources such as example code, demos, and plugins in another repository called [blockly-samples](https://github.com/google/blockly-samples/). A plugin is a self-contained piece of code that adds functionality to Blockly. Plugins can add fields, define themes, create renderers, and much more. For more information, see the [Plugins documentation](https://developers.google.com/blockly/guides/plugins/overview).

## Contributing to Blockly

Want to make Blockly better? We welcome contributions to Blockly in the form of pull requests, bug reports, documentation, answers on the forum, and more! Check out our [Contributing Guidelines](https://developers.google.com/blockly/guides/modify/contributing) for more information. You might also want to look for issues tagged "[Help Wanted](https://github.com/google/blockly/labels/help%20wanted)" which are issues we think would be great for external contributors to help with.

## Releases

The next major release will be during the last week of **March 2022**.

We release by pushing the latest code to the master branch, followed by updating the npm package, our [docs](https://developers.google.com/blockly), and [demo pages](https://google.github.io/blockly-samples/). We typically release a new version of Blockly once a quarter (every 3 months). If there are breaking bugs, such as a crash when performing a standard action or a rendering issue that makes Blockly unusable, we will cherry-pick fixes to master between releases to fix them. The [releases page](https://github.com/google/blockly/releases) has a list of all releases.

Releases are tagged by the release date (YYYYMMDD) with a leading major version number and a trailing '.0' in case we ever need a major or patch version (such as [2.20190722.1](https://github.com/google/blockly/tree/2.20190722.1)). Releases that have breaking changes or are otherwise not backwards compatible will have a new major version. Patch versions are reserved for bug-fix patches between scheduled releases.

We now have a [beta release on npm](https://www.npmjs.com/package/blockly?activeTab=versions). If you'd like to test the upcoming release, or try out a not-yet-released new API, you can use the beta channel with:

```bash
npm install blockly@beta
```
As it is a beta channel, it may be less stable, and the APIs there are subject to change.

### Branches

There are two main branches for Blockly.

**[master](https://github.com/google/blockly)** - This is the (mostly) stable current release of Blockly.

**[develop](https://github.com/google/blockly/tree/develop)** - This is where most of our work happens. Pull requests should always be made against develop. This branch will generally be usable, but may be less stable than the master branch. Once something is in develop we expect it to merge to master in the next release.

**other branches:** - Larger changes may have their own branches until they are good enough for people to try out. These will be developed separately until we think they are almost ready for release. These branches typically get merged into develop immediately after a release to allow extra time for testing.

### New APIs

Once a new API is merged into master it is considered beta until the following release. We generally try to avoid changing an API after it has been merged to master, but sometimes we need to make changes after seeing how an API is used. If an API has been around for at least two releases we'll do our best to avoid breaking it.

Unreleased APIs may change radically. Anything that is in `develop` but not `master` is subject to change without warning.

## Issues and Milestones

We typically triage all bugs within 2 working days, which includes adding any appropriate labels and assigning it to a milestone. Please keep in mind, we are a small team so even feature requests that everyone agrees on may not be prioritized.

### Milestones

**Upcoming release** - The upcoming release milestone is for all bugs we plan on fixing before the next release. This typically has the form of `year_quarter_release` (such as `2019_q2_release`). Some bugs will be added to this release when they are triaged, others may be added closer to a release.

**Bug Bash Backlog** - These are bugs that we're still prioritizing. They haven't been added to a specific release yet, but we'll consider them for each release depending on relative priority and available time.

**Icebox** - These are bugs that we do not intend to spend time on. They are either too much work or minor enough that we don't expect them to ever take priority. We are still happy to accept pull requests for these bugs.

## Good to Know

* Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs](https://saucelabs.com)
* We support IE11 and test it using [BrowserStack](https://browserstack.com)
