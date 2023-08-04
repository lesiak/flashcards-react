export type ForvoResponse = {
  attributes: {
    total: number
  },
  items: ForvoItem[]
}

export type ForvoItem = {
  id: string,
  addtime: string,
  hits: number,
  username: string,
  sex: 'f' | 'm',
  country: string,
  code: string,       //country code
  langname: string,
  pathmp3: string,
  pathogg: string
}

