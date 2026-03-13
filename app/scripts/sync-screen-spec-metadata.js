#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const MASTER_DOC = path.join(ROOT, 'docs', '積読コーチ 画面一覧 兼 画面遷移 兼 画面定義.md');
const SCREEN_SPEC_ROOT = path.join(ROOT, 'docs', 'screen-spec');
const SCREEN_SPEC_DATA = path.join(SCREEN_SPEC_ROOT, 'data');
const SCREEN_SPEC_DEF_SC = path.join(SCREEN_SPEC_ROOT, 'definitions', 'sc');
const SCREEN_SPEC_DEF_SF = path.join(SCREEN_SPEC_ROOT, 'definitions', 'sf');
const SCREEN_SPEC_DEF_ARCHIVE = path.join(SCREEN_SPEC_ROOT, 'definitions', 'archive');
const SCREEN_SPEC_ASSETS_SC = path.join(SCREEN_SPEC_ROOT, 'assets', 'screenshots', 'sc');
const SCREEN_SPEC_ASSETS_SF = path.join(SCREEN_SPEC_ROOT, 'assets', 'screenshots', 'sf');
const SCREEN_SPEC_ASSETS_ARCHIVE = path.join(SCREEN_SPEC_ROOT, 'assets', 'screenshots', 'archive');

const SNAPSHOT_TARGETS_PATH = path.join(ROOT, 'app', 'e2e', 'snapshots', 'snapshotTargets.json');
const SNAPSHOT_MANIFEST_PATH = path.join(ROOT, 'app', 'e2e', 'snapshots', 'uiSnapshotManifest.v1.json');
const SCREEN_INDEX_PATH = path.join(SCREEN_SPEC_DATA, 'screen-index.json');
const SCREEN_INDEX_JS_PATH = path.join(SCREEN_SPEC_DATA, 'screen-index.js');

const TODAY = new Date().toISOString().slice(0, 10);

const ACTIVE_IDS = [
  'SC-01', 'SC-02', 'SC-03', 'SC-04', 'SC-05', 'SC-06', 'SC-07',
  'SC-09', 'SC-10', 'SC-11', 'SC-12', 'SC-13', 'SC-14', 'SC-15',
  'SC-16', 'SC-17', 'SC-18', 'SC-19', 'SC-20', 'SC-21', 'SC-22',
  'SC-23', 'SC-24',
  'SF-01', 'SF-02', 'SF-03', 'SF-04', 'SF-05', 'SF-06', 'SF-07', 'SF-08', 'SF-09',
];

const TARGET_CONFIG = {
  'SC-01': { scenario: 'normal', suite: 'onboarding', captureSource: 'flow', captureMode: 'detox_flow', sourceRef: 'e2e/snapshots/onboarding-snapshots.e2e.js' },
  'SC-02': { scenario: 'normal', suite: 'onboarding', captureSource: 'flow', captureMode: 'detox_flow', sourceRef: 'e2e/snapshots/onboarding-snapshots.e2e.js' },
  'SC-03': { scenario: 'normal', suite: 'onboarding', captureSource: 'flow', captureMode: 'detox_flow', sourceRef: 'e2e/snapshots/onboarding-snapshots.e2e.js' },
  'SC-04': { scenario: 'normal', suite: 'home', captureSource: 'flow', captureMode: 'detox_flow', sourceRef: 'e2e/snapshots/home-snapshots.e2e.js' },
  'SC-05': { scenario: 'heavy_day', suite: 'home', captureSource: 'injected', captureMode: 'detox_injected', sourceRef: 'e2e/snapshots/home-snapshots.e2e.js' },
  'SC-06': { scenario: 'rehab', suite: 'home', captureSource: 'injected', captureMode: 'detox_injected', sourceRef: 'e2e/snapshots/home-snapshots.e2e.js' },
  'SC-07': { scenario: 'long_absence', suite: 'home', captureSource: 'injected', captureMode: 'detox_injected', sourceRef: 'e2e/snapshots/home-snapshots.e2e.js' },
  'SC-09': { scenario: 'normal', suite: 'addbook', captureSource: 'flow', captureMode: 'detox_flow', sourceRef: 'e2e/snapshots/addbook-snapshots.e2e.js' },
  'SC-10': { scenario: 'timeout_or_error', suite: 'addbook', captureSource: 'injected', captureMode: 'detox_injected', sourceRef: 'e2e/snapshots/addbook-snapshots.e2e.js' },
  'SC-11': { scenario: 'normal', suite: 'addbook', captureSource: 'flow', captureMode: 'detox_flow', sourceRef: 'e2e/snapshots/addbook-snapshots.e2e.js' },
  'SC-12': { scenario: 'normal', suite: 'session', captureSource: 'flow', captureMode: 'detox_flow', sourceRef: 'e2e/snapshots/session-snapshots.e2e.js' },
  'SC-13': { scenario: 'rehab', suite: 'session', captureSource: 'injected', captureMode: 'detox_injected', sourceRef: 'e2e/snapshots/session-snapshots.e2e.js' },
  'SC-14': { scenario: 'rehab', suite: 'session', captureSource: 'injected', captureMode: 'detox_injected', sourceRef: 'e2e/snapshots/session-snapshots.e2e.js' },
  'SC-15': { scenario: 'normal', suite: 'completion', captureSource: 'flow', captureMode: 'detox_flow', sourceRef: 'e2e/snapshots/completion-snapshots.e2e.js' },
  'SC-16': { scenario: 'normal', suite: 'completion', captureSource: 'flow', captureMode: 'detox_flow', sourceRef: 'e2e/snapshots/completion-snapshots.e2e.js' },
  'SC-17': { scenario: 'normal', suite: 'completion', captureSource: 'flow', captureMode: 'detox_flow', sourceRef: 'e2e/snapshots/completion-snapshots.e2e.js' },
  'SC-18': { scenario: 'normal', suite: 'completion', captureSource: 'flow', captureMode: 'detox_flow', sourceRef: 'e2e/snapshots/completion-snapshots.e2e.js' },
  'SC-19': { scenario: 'finished_book', suite: 'completion', captureSource: 'flow', captureMode: 'detox_flow', sourceRef: 'e2e/snapshots/completion-snapshots.e2e.js' },
  'SC-20': { scenario: 'normal', suite: 'library', captureSource: 'flow', captureMode: 'detox_flow', sourceRef: 'e2e/snapshots/library-snapshots.e2e.js' },
  'SC-21': { scenario: 'normal', suite: 'library', captureSource: 'flow', captureMode: 'detox_flow', sourceRef: 'e2e/snapshots/library-snapshots.e2e.js' },
  'SC-22': { scenario: 'normal', suite: 'settings', captureSource: 'flow', captureMode: 'detox_flow', sourceRef: 'e2e/snapshots/settings-snapshots.e2e.js' },
  'SC-23': { scenario: 'due', suite: 'home', captureSource: 'injected', captureMode: 'detox_injected', sourceRef: 'e2e/snapshots/home-snapshots.e2e.js' },
  'SC-24': { scenario: 'normal', suite: 'session', captureSource: 'flow', captureMode: 'detox_flow', sourceRef: 'e2e/snapshots/session-snapshots.e2e.js' },
  'SF-01': { scenario: 'normal', suite: 'surface-native', captureSource: 'native_ui', captureMode: 'xctest_simctl', sourceRef: 'ios/appUITests/SurfaceSnapshotUITests.swift' },
  'SF-02': { scenario: 'rehab', suite: 'surface-native', captureSource: 'native_ui', captureMode: 'xctest_simctl', sourceRef: 'ios/appUITests/SurfaceSnapshotUITests.swift' },
  'SF-03': { scenario: 'normal', suite: 'surface-native', captureSource: 'native_ui', captureMode: 'xctest_simctl', sourceRef: 'ios/appUITests/SurfaceSnapshotUITests.swift' },
  'SF-04': { scenario: 'rehab', suite: 'surface-native', captureSource: 'native_ui', captureMode: 'xctest_simctl', sourceRef: 'ios/appUITests/SurfaceSnapshotUITests.swift' },
  'SF-05': { scenario: 'normal', suite: 'surface-native', captureSource: 'native_ui', captureMode: 'xctest_simctl', sourceRef: 'ios/appUITests/SurfaceSnapshotUITests.swift' },
  'SF-06': { scenario: 'rehab', suite: 'surface-native', captureSource: 'native_ui', captureMode: 'xctest_simctl', sourceRef: 'ios/appUITests/SurfaceSnapshotUITests.swift' },
  'SF-07': { scenario: 'rehab', suite: 'surface-native', captureSource: 'native_ui', captureMode: 'xctest_simctl', sourceRef: 'ios/appUITests/SurfaceSnapshotUITests.swift' },
  'SF-08': { scenario: 'normal', suite: 'surface-native', captureSource: 'native_ui', captureMode: 'xctest_simctl', sourceRef: 'ios/appUITests/SurfaceSnapshotUITests.swift' },
  'SF-09': { scenario: 'normal', suite: 'surface-native', captureSource: 'native_ui', captureMode: 'xctest_simctl', sourceRef: 'ios/appUITests/SurfaceSnapshotUITests.swift' },
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeText(filePath, value) {
  fs.writeFileSync(filePath, value, 'utf8');
}

function buildIndexScript(indexPayload) {
  return `window.__SCREEN_SPEC_INDEX__ = ${JSON.stringify(indexPayload, null, 2)};\n`;
}

function readExistingDefinition(definitionPath) {
  if (!fs.existsSync(definitionPath)) {
    return { title: '', sourceBody: '' };
  }
  const raw = readText(definitionPath);
  const heading = raw.match(/^#\s+(SC-\d{2}|SF-\d{2})\s+(.+)$/m);
  const sourceBody = raw.match(/## 親台帳原文\s+```markdown\n([\s\S]*?)\n```/m);
  return {
    title: heading?.[2]?.trim() ?? '',
    sourceBody: sourceBody?.[1]?.trim() ?? '',
  };
}

function parseDefinitionSections(raw) {
  const lines = raw.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === '## 6. 画面定義');
  const scoped = start >= 0 ? lines.slice(start + 1) : lines;

  const sections = new Map();
  let current = null;

  function flushCurrent() {
    if (!current) return;
    const body = current.lines.join('\n').trim();
    for (const id of current.ids) {
      sections.set(id, {
        title: current.title,
        body,
      });
    }
  }

  for (const line of scoped) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      const text = heading[1].trim();
      const single = text.match(/^(SC-\d{2}|SF-\d{2})\s+(.+)$/);
      const sfGroup = text.match(/^SF-05\s*\/\s*06\s*\/\s*07\s*\/\s*09\s+(.+)$/);

      flushCurrent();
      current = null;

      if (single) {
        current = { ids: [single[1]], title: single[2].trim(), lines: [] };
        continue;
      }
      if (sfGroup) {
        current = { ids: ['SF-05', 'SF-06', 'SF-07', 'SF-09'], title: sfGroup[1].trim(), lines: [] };
        continue;
      }
      continue;
    }

    if (current) current.lines.push(line);
  }

  flushCurrent();
  return sections;
}

function parseFieldBlock(body, label) {
  const lines = body.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    if (!trimmed.startsWith(`* ${label}:`)) continue;

    const first = trimmed.slice(`* ${label}:`.length).trim();
    const out = [];
    if (first) out.push(first);

    let j = i + 1;
    while (j < lines.length) {
      const line = lines[j];
      const lineTrimmed = line.trim();
      if (/^\* /.test(line)) break;
      if (lineTrimmed.length > 0) {
        out.push(line.replace(/^\s{2}/, '').trimEnd());
      }
      j += 1;
    }

    return out.join('\n').trim();
  }
  return '';
}

function ensureTrailingNewline(text) {
  return text.endsWith('\n') ? text : `${text}\n`;
}

function toCodeFence(content) {
  return `\`\`\`markdown\n${content}\n\`\`\``;
}

function buildDefinitionMarkdown({ id, title, type, status, sectionBody, imagePath, captureId, captureMode, sourceRef, scenario }) {
  const role = parseFieldBlock(sectionBody, '役割') || '（親台帳原文参照）';
  const condition = parseFieldBlock(sectionBody, '表示条件') || '（親台帳原文参照）';
  const primaryCta = parseFieldBlock(sectionBody, '主 CTA') || '（親台帳原文参照）';
  const secondaryCta = parseFieldBlock(sectionBody, '副 CTA') || '（親台帳原文参照）';
  const elements = parseFieldBlock(sectionBody, '主要表示要素') || '（親台帳原文参照）';
  const transitions = parseFieldBlock(sectionBody, '遷移') || '（親台帳原文参照）';
  const fallback = parseFieldBlock(sectionBody, '異常時縮退') || '（該当なし / 親台帳原文参照）';
  const bodyText = sectionBody.length > 0 ? sectionBody : '（親台帳に詳細がありません）';

  return ensureTrailingNewline(`# ${id} ${title}

## ID
${id}

## 種別
${type === 'screen' ? 'Screen' : 'Surface'}

## ステータス
${status === 'archived' ? 'archived' : 'active'}

## 役割
${role}

## 表示条件
${condition}

## 主/副CTA
### 主CTA
${primaryCta}

### 副CTA
${secondaryCta}

## 主要要素
${elements}

## 遷移
${transitions}

## 異常時縮退
${fallback}

## 画面イメージ(実画面)
![${id} screenshot](../../${imagePath})

## 画像取得元
- captureId: ${captureId}
- scenario: ${scenario}
- captureMode: ${captureMode}
- sourceRef: ${sourceRef}
- refresh: \`cd ${path.join(ROOT, 'app')} && npm run e2e:capture:docs && npm run docs:screen-spec:refresh\`

## 親台帳原文
${toCodeFence(bodyText)}
`);
}

function uiTypeFor(id) {
  return id.startsWith('SF-') ? 'surface' : 'screen';
}

function assetPathFor(id, scenario, status) {
  if (status === 'archived') {
    return `assets/screenshots/archive/${id}_archived.png`;
  }
  const group = id.startsWith('SF-') ? 'sf' : 'sc';
  return `assets/screenshots/${group}/${id}_${scenario}.png`;
}

function sortById(ids) {
  return [...ids].sort((a, b) => {
    const [aPrefix, aNum] = a.split('-');
    const [bPrefix, bNum] = b.split('-');
    if (aPrefix !== bPrefix) return aPrefix.localeCompare(bPrefix);
    return Number(aNum) - Number(bNum);
  });
}

function run() {
  ensureDir(SCREEN_SPEC_ROOT);
  ensureDir(SCREEN_SPEC_DATA);
  ensureDir(SCREEN_SPEC_DEF_SC);
  ensureDir(SCREEN_SPEC_DEF_SF);
  ensureDir(SCREEN_SPEC_DEF_ARCHIVE);
  ensureDir(SCREEN_SPEC_ASSETS_SC);
  ensureDir(SCREEN_SPEC_ASSETS_SF);
  ensureDir(SCREEN_SPEC_ASSETS_ARCHIVE);

  const master = readText(MASTER_DOC);
  const sections = parseDefinitionSections(master);

  const titleOverrides = {
    'SF-05': 'Live Activity_15分',
    'SF-06': 'Live Activity_3分',
    'SF-07': 'Live Activity_1分',
    'SF-09': 'Live Activity_5分',
  };

  const orderedIds = sortById([...ACTIVE_IDS, 'SC-08']);
  const indexEntries = [];
  const snapshotTargets = [];
  const manifestEntries = [];

  for (const id of orderedIds) {
    const isArchived = id === 'SC-08';
    const type = uiTypeFor(id);
    const status = isArchived ? 'archived' : 'active';

    const definitionPath = isArchived
      ? `definitions/archive/${id}.md`
      : id.startsWith('SF-')
        ? `definitions/sf/${id}.md`
        : `definitions/sc/${id}.md`;
    const absoluteDefinitionPath = path.join(SCREEN_SPEC_ROOT, definitionPath);
    const existingDefinition = readExistingDefinition(absoluteDefinitionPath);

    const section = sections.get(id);
    const title = titleOverrides[id] || section?.title || existingDefinition.title || id;

    const config = TARGET_CONFIG[id];
    const scenario = isArchived ? 'archived' : config.scenario;
    const captureId = isArchived ? `${id}:archived` : `${id}:${scenario}`;
    const captureMode = isArchived ? 'archived' : config.captureMode;
    const sourceRef = isArchived
      ? 'docs/積読コーチ 画面一覧 兼 画面遷移 兼 画面定義.md'
      : config.sourceRef;

    const imagePath = assetPathFor(id, scenario, status);
    const sectionBody = section?.body ?? existingDefinition.sourceBody ?? '';

    indexEntries.push({
      id,
      type,
      status,
      title,
      definitionPath,
      imagePath,
      captureId,
      scenario,
      captureMode,
      sourceRef,
      suite: isArchived ? 'archive' : config.suite,
    });

    if (!isArchived) {
      snapshotTargets.push({
        screenId: id,
        scenario,
        captureSource: config.captureSource,
        suite: config.suite,
      });

      manifestEntries.push({
        targetId: captureId,
        uiId: id,
        uiType: type,
        variantId: scenario,
        baseline: true,
        captureMode: config.captureMode,
        status: 'implemented',
        sourceRef: config.sourceRef,
        artifactKey: config.captureMode === 'xctest_simctl'
          ? `surface-snapshots/${id}_${scenario}`
          : `flow-snapshots/${id}_${scenario}_part001`,
      });
    }

    const markdown = buildDefinitionMarkdown({
      id,
      title,
      type,
      status,
      sectionBody,
      imagePath,
      captureId,
      captureMode,
      sourceRef,
      scenario,
    });
    writeText(absoluteDefinitionPath, markdown);
  }

  const indexPayload = {
    version: '1.0.0',
    updatedAt: TODAY,
    entries: indexEntries,
  };
  writeText(SCREEN_INDEX_PATH, `${JSON.stringify(indexPayload, null, 2)}\n`);
  writeText(SCREEN_INDEX_JS_PATH, buildIndexScript(indexPayload));

  writeText(SNAPSHOT_TARGETS_PATH, `${JSON.stringify(snapshotTargets, null, 2)}\n`);

  writeText(SNAPSHOT_MANIFEST_PATH, `${JSON.stringify({
    version: '2.0.0',
    updatedAt: TODAY,
    coverageRule: 'Full SC+SF snapshots (SC-08 archived)',
    scope: {
      mode: 'full_sc_sf',
      description: 'All SC and SF are baseline targets except archived SC-08.',
      screenIds: snapshotTargets.map((target) => target.screenId),
    },
    entries: manifestEntries,
  }, null, 2)}\n`);

  console.log('[screen-spec] metadata synced');
  console.log(JSON.stringify({
    indexEntries: indexEntries.length,
    activeTargets: snapshotTargets.length,
    archived: 1,
  }, null, 2));
}

run();
