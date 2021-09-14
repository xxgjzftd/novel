import { appendFile } from 'fs/promises'
import { get } from 'https'

import { unified } from 'unified'
import rp from 'rehype-parse'
import { select, selectAll } from 'hast-util-select'
import { toNlcst } from 'hast-util-to-nlcst'
import { ParseEnglish } from 'parse-english'
import { toString } from 'nlcst-to-string'

const origin = 'https://wap.biquger.com'
let next = ''

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
                  const content = select('#nr', tree)
                  aa.find((el) => el.children[0]?.value?.includes('上一章')) &&
                    content.children.unshift({ type: 'text', value: select('title', tree).children[0].value })
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
                appendFile('dist/novel.txt', String(file)).then(
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

x('/wapbiquge/3694/1159644')
