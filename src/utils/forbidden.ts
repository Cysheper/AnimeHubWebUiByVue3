// 违禁词列表
const forbiddenWords = [
  // 敏感政治词汇
  '法轮功',
  '六四',
  '天安门事件',
  '习近平',
  '共产党',
  '毛泽东',
  '民主运动',
  '独裁',
  '专制',
  '镇压',
  '邓小平',
  '走资派',
  
  // 色情相关
  '操',
  '裸体',
  
  // 赌博相关
  '赌博',
  '博彩',
  '网赌',
  
  // 诈骗相关
  '代刷',
  '刷单',
  '免费领',
  
  // 脏话
  '傻逼',
  '操你妈',
  '草泥马',
  '妈的',
  'fuck',
  'shit',
  
  // 可以继续添加...
]

// 构建正则表达式
const buildRegex = () => {
  const escaped = forbiddenWords.map(word => 
    word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  )
  return new RegExp(escaped.join('|'), 'i')
}

const forbiddenRegex = buildRegex()

/**
 * 检查内容是否包含违禁词
 * @param content 要检查的内容
 * @returns 如果包含违禁词返回 true，否则返回 false
 */
export const containsForbiddenWords = (content: string): boolean => {
  return forbiddenRegex.test(content)
}

/**
 * 获取匹配到的违禁词（用于调试）
 * @param content 要检查的内容
 * @returns 匹配到的违禁词，没有则返回 null
 */
export const getMatchedForbiddenWord = (content: string): string | null => {
  const match = content.match(forbiddenRegex)
  return match ? match[0] : null
}

export default forbiddenWords
