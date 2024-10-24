import Editorr from '@/components/Editor'
import React from 'react'

function roomId({params}:{params:{roomid:string}}) {
  return (
    <div>
      <Editorr roomId={params.roomid}/>
    </div>
  )
}

export default roomId
