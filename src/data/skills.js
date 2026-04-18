import {
  SiHtml5, SiJavascript, SiCss, SiReact, SiExpress,
  SiMongodb, SiPostgresql, SiJest,
  SiNpm, SiGithub, SiVscodium, SiPostman, SiNodedotjs,
} from 'react-icons/si'

export const skillCategories = [
  {
    name: 'Languages',
    items: [
      { label: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
      { label: 'HTML',       icon: SiHtml5,      color: '#E34F26' },
      { label: 'CSS',        icon: SiCss,        color: '#1572B6' },
      { label: 'SQL',        icon: null,         color: '#00758F', abbrev: 'SQL' },
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
      { label: 'Node.js',  icon: SiNodedotjs, color: '#539E43' },
      { label: 'Express',  icon: SiExpress,   color: '#ffffff' },
      { label: 'REST API', icon: null,         color: '#22d3ee', abbrev: 'API' },
    ],
  },
  {
    name: 'Databases',
    items: [
      { label: 'MongoDB',    icon: SiMongodb,    color: '#47A248' },
      { label: 'PostgreSQL', icon: SiPostgresql, color: '#4169E1' },
      { label: 'Mongoose',   icon: null,         color: '#880000', abbrev: 'ODM' },
    ],
  },
  {
    name: 'Testing',
    items: [
      { label: 'Jest',      icon: SiJest, color: '#C21325' },
      { label: 'SuperTest', icon: null,   color: '#e05c5c', abbrev: 'ST' },
    ],
  },
  {
    name: 'Tools',
    items: [
      { label: 'NPM',     icon: SiNpm,      color: '#CB3837' },
      { label: 'GitHub',  icon: SiGithub,   color: '#ffffff' },
      { label: 'VS Code', icon: SiVscodium, color: '#007ACC' },
      { label: 'Postman', icon: SiPostman,  color: '#FF6C37' },
    ],
  },
]
