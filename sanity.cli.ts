                        import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'yv2hgb0y',
    dataset: 'production'
  },
  // Build the reviewed local packages instead of an unpinned remote runtime.
  deployment: {
    autoUpdates: false,
    appId: 'eva65mpo59vt7kgm8o6qmyqa',
  },
  studioHost: 'ali-portfolio-studio'

})
