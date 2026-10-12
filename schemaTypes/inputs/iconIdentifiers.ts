export const localIds = ['local:html5', 'local:css3', 'local:javascript', 'local:react', 'local:figma', 'local:mui', 'local:git', 'local:redux']
const legacyPaths: Record<string, string> = {
  'react-icons/fa/FaHtml5': 'local:html5', 'react-icons/fa/FaCss3': 'local:css3',
  'react-icons/io5/IoLogoJavascript': 'local:javascript', 'react-icons/fa/FaReact': 'local:react',
  'react-icons/fa/FaFigma': 'local:figma', 'react-icons/si/SiMui': 'local:mui',
  'react-icons/fa/FaGitAlt': 'local:git', 'react-icons/si/SiRedux': 'local:redux',
}
export const isIconId = (value: unknown): value is string => typeof value === 'string' && value.length <= 160 &&
  (localIds.includes(value) || (!value.startsWith('local:') && /^[a-z0-9]+(?:-[a-z0-9]+)*:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)))
export const legacyIconId = (path: unknown, pkg: unknown) => typeof path === 'string' && Object.hasOwn(legacyPaths, path) &&
  (pkg == null || pkg === path.split('/')[1]) ? legacyPaths[path] : undefined
