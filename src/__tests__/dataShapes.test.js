import { projects } from '../data/projects'
import { skillCategories } from '../data/skills'

describe('projects data', () => {
  test('is an array', () => {
    expect(Array.isArray(projects)).toBe(true)
  })

  test('each project has required fields', () => {
    projects.forEach(p => {
      expect(p).toHaveProperty('id')
      expect(p).toHaveProperty('title')
      expect(p).toHaveProperty('description')
      expect(p).toHaveProperty('tech')
      expect(p).toHaveProperty('image')
      expect(p).toHaveProperty('githubUrl')
      expect(Array.isArray(p.tech)).toBe(true)
    })
  })

  test('project ids are unique', () => {
    const ids = projects.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('skills data', () => {
  test('is an array of categories', () => {
    expect(Array.isArray(skillCategories)).toBe(true)
  })

  test('each category has name and items', () => {
    skillCategories.forEach(cat => {
      expect(cat).toHaveProperty('name')
      expect(cat).toHaveProperty('items')
      expect(Array.isArray(cat.items)).toBe(true)
    })
  })

  test('each skill item has label and valid icon/color pairing', () => {
    skillCategories.forEach(cat => {
      cat.items.forEach(item => {
        expect(item).toHaveProperty('label')
        expect(item).toHaveProperty('color')
        if (item.icon !== null && item.icon !== undefined) {
          expect(typeof item.icon).toBe('function')
        }
        // color is always required (used for TextIcon when icon is null)
        expect(item.color).toBeTruthy()
      })
    })
  })
})
