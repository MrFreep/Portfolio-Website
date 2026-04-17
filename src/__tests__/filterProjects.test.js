// src/__tests__/filterProjects.test.js
import { filterProjects } from '../components/Work/Work'

const mockProjects = [
  { id: '1', tech: ['React', 'Node'] },
  { id: '2', tech: ['Express', 'MongoDB'] },
  { id: '3', tech: ['React', 'PostgreSQL'] },
]

describe('filterProjects', () => {
  test('returns all projects for "All" filter', () => {
    expect(filterProjects(mockProjects, 'All')).toHaveLength(3)
  })

  test('filters by tech tag', () => {
    expect(filterProjects(mockProjects, 'React')).toHaveLength(2)
  })

  test('returns empty array when no match', () => {
    expect(filterProjects(mockProjects, 'Python')).toHaveLength(0)
  })
})
