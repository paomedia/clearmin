// Quill WYSIWYG editor (https://quilljs.com)
document.addEventListener('DOMContentLoaded', () => {
  const editor = document.getElementById('editor')
  editor.style.height = `${Math.max(window.innerHeight - 440, 200)}px`

  // eslint-disable-next-line no-new
  new Quill(editor, {
    theme: 'snow',
    placeholder: 'Write something awesome...',
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'clean'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }, { align: [] }],
        ['link', 'image', 'blockquote', 'code-block']
      ]
    }
  })
})
