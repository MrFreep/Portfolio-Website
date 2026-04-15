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

  test('each skill item has label and optional icon', () => {
    skillCategories.forEach(cat => {
      cat.items.forEach(item => {
        expect(item).toHaveProperty('label')
      })
    })
  })
})
