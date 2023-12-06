const path = require('node:path');

module.exports = (plop) => {
  plop.setGenerator('module', {
    description: 'Create a new module with service,resolver,models,dto and vo',
    prompts: [
      // npx plop
      {
        type: 'input',
        name: 'name',
        message: '请输入模板名字',
      },
    ],
    actions: [
      {
        type: 'add',
        path: path.join(
          __dirname,
          'src/modules/{{kebabCase name}}/{{kebabCase name}}.module.ts',
        ),
        templateFile: path.join(
          __dirname,
          'plopTemplates/module/card.module.hbs',
        ),
      },
      {
        type: 'add',
        path: path.join(
          __dirname,
          'src/modules/{{kebabCase name}}/{{kebabCase name}}.service.ts',
        ),
        templateFile: path.join(
          __dirname,
          'plopTemplates/module/card.service.hbs',
        ),
      },
      {
        type: 'add',
        path: path.join(
          __dirname,
          'src/modules/{{kebabCase name}}/{{kebabCase name}}.resolver.ts',
        ),
        templateFile: path.join(
          __dirname,
          'plopTemplates/module/card.resolver.hbs',
        ),
      },
      {
        type: 'add',
        path: path.join(
          __dirname,
          'src/modules/{{kebabCase name}}/models/{{kebabCase name}}.entity.ts',
        ),
        templateFile: path.join(
          __dirname,
          'plopTemplates/module/models/card.entity.hbs',
        ),
      },
      {
        type: 'add',
        path: path.join(
          __dirname,
          'src/modules/{{kebabCase name}}/dto/{{kebabCase name}}.dto.ts',
        ),
        templateFile: path.join(
          __dirname,
          'plopTemplates/module/dto/card.dto.hbs',
        ),
      },
      {
        type: 'add',
        path: path.join(
          __dirname,
          'src/modules/{{kebabCase name}}/vo/{{kebabCase name}}.vo.ts',
        ),
        templateFile: path.join(
          __dirname,
          'plopTemplates/module/vo/card.vo.hbs',
        ),
      },
      {
        type: 'modify',
        path: './src/app.module.ts',
        pattern: /import { Module } from '@nestjs\/common';/g,
        template: "import { Module } from '@nestjs/common';\nimport { {{pascalCase name}}Module } from './modules/{{kebabCase name}}/{{kebabCase name}}.module';"
      },
      {
        type: 'modify',
        path: './src/app.module.ts',
        pattern: /imports: \[([\s\S]*?)\](?=\s*,\s*controllers)/g,
        template: 'imports: [$1  {{pascalCase name}}Module,\n  ]'
      }
    ],
  });
};
