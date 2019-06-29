module.exports = {
  // Specifies the ESLint parser
  parser: '@typescript-eslint/parser',
  extends: [
    // Uses the recommended rules from @eslint-plugin-react
    'plugin:react/recommended',
    // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:@typescript-eslint/recommended',
    // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'prettier/@typescript-eslint',
    // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors.
    // Make sure this is always the last configuration in the extends array.
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  rules: {
    'react/display-name': 'off',
    'react/prop-types': 'off',
    // 限制数组类型必须使用 Array<T> 或 T[]
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/camelcase': 'off',
    // 类名与接口名必须为驼峰式
    '@typescript-eslint/class-name-casing': 'error',
    // 函数返回值必须与声明的类型一致，【编译阶段检查就足够了】
    '@typescript-eslint/explicit-function-return-type': 'off',
    // 必须设置类的成员的可访问性
    '@typescript-eslint/explicit-member-accessibility': 'off',
    // 约束泛型的命名规则
    '@typescript-eslint/generic-type-naming': 'off',
    // 接口名称必须以 I 开头
    '@typescript-eslint/interface-name-prefix': 'off',
    // 禁止使用 any
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    // 有时需要动态引入，还是需要用 require
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-type-alias': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
  },
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
}
