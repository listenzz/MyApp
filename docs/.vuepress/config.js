module.exports = {
  title: 'React Native 工程实践',
  description: 'React Native CI/CD, 工程实践',
  base: '/rndevops/',
  themeConfig: {
    home: '/',
    lastUpdatedText: '上次更新',
    sidebarDepth: 2,
    contributors: false,
    repo: 'https://github.com/listenzz',
    editLink: false,
    docsBranch: 'master',
    navbar: [
      { text: '首页', link: 'https://todoit.tech/', target:'_self', rel:''},
      { text: 'React Native 指南', link: 'https://todoit.tech/rn/', target:'_self', rel:'' },
      { text: '文档', children: [
        {
          text: 'Hybrid Navigation',
          link: 'https://todoit.tech/hybrid-navigation/',
          target:'_self', 
          rel:''
        }, 
        {
          text: 'React Native 工程实践',
          link: '/',
        },]
      }
    ],
    sidebar: {
      '/': [
        'lint',
        'env',
        'ios',
        'android',
        'ci',
        'sentry',
        'hotfix',
      ]
    }
  },

  markdown: {
    code: {
      lineNumbers: false
    }
  },
}