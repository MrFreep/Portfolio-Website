import {
  SiJavascript, SiCss, SiReact, SiExpress,
  SiMongodb, SiPostgresql, SiJest,
  SiNpm, SiGithub, SiVscodium, SiPostman,
} from 'react-icons/si'

export const skillCategories = [
  {
    name: 'Languages',
    items: [
      { label: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
      { label: 'CSS', icon: SiCss, color: '#1572B6' },
      { label: 'SQL', icon: null, color: null },
    ],
  },
  {
    name: 'Frontend',
    items: [
      { label: 'React', icon: SiReact, color: '#61DAFB' },
    ],
  },
  {
    name: 'Backend',
    items: [
      { label: 'Express', icon: SiExpress, color: '#ffffff' },
      { label: 'REST API', icon: null, color: null },
    ],
  },
  {
    name: 'Databases',
    items: [
      { label: 'MongoDB', icon: SiMongodb, color: '#47A248' },
      { label: 'PostgreSQL', icon: SiPostgresql, color: '#4169E1' },
    ],
  },
  {
    name: 'Testing',
    items: [
      { label: 'Jest', icon: SiJest, color: '#C21325' },
      { label: 'SuperTest', icon: null, color: null },
    ],
  },
  {
    name: 'Tools',
    items: [
      { label: 'NPM', icon: SiNpm, color: '#CB3837' },
      { label: 'Mongoose', icon: null, color: null },
      { label: 'GitHub', icon: SiGithub, color: '#ffffff' },
      { label: 'VS Code', icon: SiVscodium, color: '#007ACC' },
      { label: 'Postman', icon: SiPostman, color: '#FF6C37' },
    ],
  },
]
