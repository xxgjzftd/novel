import { open, writeFile } from 'fs/promises'
import { get } from 'https'

import { unified } from 'unified'
import rp from 'rehype-parse'
import { select, selectAll } from 'hast-util-select'
import { toNlcst } from 'hast-util-to-nlcst'
import { ParseEnglish } from 'parse-english'
import { toString } from 'nlcst-to-string'

const origin = 'https://wap.biquger.com'
const txt = await open('dist/无限道武者路.txt', 'a')
let next = '/wapbiquge/3694/1159644'

const x = (start) => {
  get(
    origin + start,
    (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on(
        'end',
        () => {
          unified()
            .use(rp)
            .use(
              function () {
                return function transformer (tree, file) {
                  const aa = selectAll('a.dise.sm', tree)
                  next = aa.find((el) => el.children[0]?.value?.includes('下一')).properties?.href
                  writeFile('dist/data.txt', next)
                  const content = select('#nr', tree)
                  let index
                  while (~(index = content.children.findIndex((el) => el.properties?.id === 'content_tip'))) {
                    content.children.splice(index, 1)
                  }
                  index = content.children.findIndex((el) => el.value?.includes('本章未完，请点击下一页继续阅读'))
                  if (~index) content.children.splice(index, 1)
                  aa.find((el) => el.children[0]?.value?.includes('上一章')) &&
                    content.children.unshift(
                      { type: 'text', value: select('title', tree).children[0].value.split('_')[1] }
                    )
                  return toNlcst(content, file, ParseEnglish)
                }
              }
            )
            .use(
              function () {
                this.Compiler = function (tree) {
                  return toString(tree)
                }
              }
            )
            .process(data)
            .then(
              (file) => {
                txt.appendFile(String(file)).then(
                  (_) => {
                    setTimeout(
                      () => {
                        x(next)
                      },
                      Math.ceil(Math.random() * 10) * 1000
                    )
                  }
                )
              }
            )
        }
      )
    }
  )
}

x(next)
