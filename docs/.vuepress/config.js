module.exports = {
  title: 'React Native 工程实践',
  description: 'React Native CI/CD, 工程实践',
  base: '/rn/devops/',
  themeConfig: {
    home: '/',
    lastUpdatedText: '上次更新',
    sidebarDepth: 2,
    contributors: false,
    repo: 'https://github.com/listenzz/MyApp',
    editLink: false,
    docsBranch: 'master',
    navbar: [
      { text: '首页', link: '/', },
      { text: '博客', link: 'https://todoit.tech/', target: '_self', rel: '' },
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