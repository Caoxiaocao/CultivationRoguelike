/**
 * 问道 · 青冥秘境 全量自动化测试运行器 (All-In-One Test Suite Runner)
 * 依次执行全套核心系统、数值平衡、领主机制、武器槽位、贴图以及冒烟测试
 */
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const testFiles = [
  'smoke-test.mjs',
  'test_all_24_weapon_cards.mjs',
  'test_test_level.mjs',
  'test_dragon_fire_textures.mjs',
  'test_chain_arc.mjs',
  'test_blazing_fire.mjs',
  'test_blazing_fire_perf_and_scale.mjs',
  'test_combat_ui_and_slots.mjs',
  'test_minimal_weapon_slots.mjs',
  'test_enemy_spritesheets.mjs',
  'test_corpse_emperor.mjs',
  'test_asura_demon.mjs',
  'test_player_weapon_sheets.mjs',
  'test_ding_crush.mjs',
  'test_dragon_armor_fist.mjs',
  'test_damage_numbers.mjs',
  'test_all_enemy_damage.mjs',
  'test_hit_feedback.mjs',
  'test_celestial_peng.mjs',
  'test_primordial_god.mjs',
  'verify_asset_paths.mjs'
]

console.log('====================================================')
console.log('       问道 · 青冥秘境 全量自动化集成测试启动       ')
console.log('====================================================\n')

let overallPassed = 0
let overallFailed = 0
const failedSuites = []

for (const file of testFiles) {
  const filePath = resolve('tools', file)
  console.log(`\n▶ [RUNNING] tools/${file} ...`)
  const start = Date.now()
  const res = spawnSync(process.execPath, [filePath], {
    stdio: 'inherit',
    env: process.env
  })
  const duration = ((Date.now() - start) / 1000).toFixed(2)

  if (res.status === 0) {
    console.log(`✔ [PASSED] tools/${file} (${duration}s)`)
    overallPassed++
  } else {
    console.error(`✖ [FAILED] tools/${file} (exit code ${res.status}) (${duration}s)`)
    overallFailed++
    failedSuites.push(file)
  }
}

console.log('\n====================================================')
console.log(`测试套件总计: ${testFiles.length} 个`)
console.log(`通过套件: ${overallPassed} 个`)
console.log(`失败套件: ${overallFailed} 个`)
console.log('====================================================')

if (overallFailed > 0) {
  console.error('\n以下套件执行未通过:', failedSuites)
  process.exit(1)
} else {
  console.log('\n🎉 全部测试套件均已顺利通过！\n')
  process.exit(0)
}
