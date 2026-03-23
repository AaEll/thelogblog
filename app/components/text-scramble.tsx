'use client'

import { useEffect } from 'react'

const CHARS = '!@#$%^&*[]{}|<>/?0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const WAVE_WIDTH = 1
const SPEED = 1 // characters to advance per frame
const INTERVAL = 1000 / 15 // ~15fps
const SPAWN_MS = 60000 // new wave every minute

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)]
}

type NodeEntry = { node: Text; chars: string[] }
type CharRef = { entry: NodeEntry; idx: number; original: string }

export function TextScramble() {
  useEffect(() => {
    const article = document.querySelector('article')
    if (!article) return

    const nodeEntries: NodeEntry[] = []
    const allChars: CharRef[] = []

    const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT)
    let textNode: Text
    while ((textNode = walker.nextNode() as Text)) {
      const text = textNode.textContent || ''
      if (!text.trim()) continue
      const entry: NodeEntry = { node: textNode, chars: text.split('') }
      nodeEntries.push(entry)
      for (let i = 0; i < text.length; i++) {
        allChars.push({ entry, idx: i, original: text[i] })
      }
    }

    const flush = (entry: NodeEntry) => {
      entry.node.textContent = entry.chars.join('')
    }

    const restoreAll = () => {
      for (const ref of allChars) ref.entry.chars[ref.idx] = ref.original
      for (const entry of nodeEntries) flush(entry)
    }

    const waves: { pos: number }[] = []
    let animId: number
    let lastTime = 0

    const step = (timestamp: number) => {
      animId = requestAnimationFrame(step)
      if (timestamp - lastTime < INTERVAL) return
      lastTime = timestamp

      if (waves.length === 0) return

      const dirty = new Set<NodeEntry>()

      for (let w = waves.length - 1; w >= 0; w--) {
        const wave = waves[w]
        const prevPos = wave.pos
        wave.pos += SPEED

        // Restore characters falling out of the trailing edge
        const restoreFrom = prevPos - WAVE_WIDTH + 1
        const restoreTo = wave.pos - WAVE_WIDTH
        for (let i = restoreFrom; i <= restoreTo; i++) {
          if (i >= 0 && i < allChars.length) {
            const ref = allChars[i]
            ref.entry.chars[ref.idx] = ref.original
            dirty.add(ref.entry)
          }
        }

        // Scramble characters in the wave window
        const waveBack = Math.max(0, wave.pos - WAVE_WIDTH + 1)
        const waveFront = Math.min(wave.pos, allChars.length - 1)
        for (let i = waveBack; i <= waveFront; i++) {
          const ref = allChars[i]
          if (ref.original === ' ' || ref.original === '\n') continue
          ref.entry.chars[ref.idx] = randomChar()
          dirty.add(ref.entry)
        }

        if (wave.pos >= allChars.length + WAVE_WIDTH) {
          waves.splice(w, 1)
        }
      }

      for (const entry of dirty) flush(entry)
    }

    const spawnWave = () => waves.push({ pos: 0 })

    // First wave after 2s, then one every 15s
    const initialTimeout = setTimeout(() => {
      spawnWave()
      animId = requestAnimationFrame(step)
    }, 2000)

    const spawnInterval = setInterval(spawnWave, SPAWN_MS)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(spawnInterval)
      cancelAnimationFrame(animId)
      restoreAll()
    }
  }, [])

  return null
}
