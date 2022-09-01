import { defaultTheme } from 'vuepress'

module.exports = {
  title: 'React Native 工程实践',
  description: 'React Native CI/CD, 工程实践',
  base: '/rn/devops/',
  theme: defaultTheme({
    home: '/',
    lastUpdatedText: '上次更新',
    contributors: false,
    repo: 'https://github.com/listenzz/MyApp',
    editLink: false,
    navbar: [
      { text: '首页', link: '/', },
      { text: 'React Native 开发指南', link: 'https://todoit.tech/' },
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
  }),
 
  markdown: {
    code: {
      lineNumbers: false
    }
  },
}