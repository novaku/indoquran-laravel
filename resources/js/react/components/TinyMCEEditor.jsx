import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import PropTypes from 'prop-types';
import TINYMCE_CONFIG from '../config/tinymce.config';

const TinyMCEEditor = ({ content, onChange, placeholder = 'Mulai menulis konten artikel di sini...' }) => {
  const editorRef = useRef(null);

  const handleEditorChange = (newContent) => {
    if (onChange) {
      onChange(newContent);
    }
  };

  return (
    <Editor
      apiKey={TINYMCE_CONFIG.apiKey}
      onInit={(evt, editor) => editorRef.current = editor}
      value={content}
      onEditorChange={handleEditorChange}
      init={{
        height: TINYMCE_CONFIG.height,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
          'emoticons', 'codesample', 'quickbars'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | link image media table | code preview fullscreen | help',
        content_style: `
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            font-size: 14px;
            line-height: 1.6;
            padding: 10px;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          table td, table th {
            border: 1px solid #ddd;
            padding: 8px;
          }
        `,
        placeholder: placeholder,
        language: TINYMCE_CONFIG.language,
        branding: false,
        promotion: false,
        resize: true,
        
        // Image upload handler
        images_upload_handler: async (blobInfo, progress) => {
          return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('image', blobInfo.blob(), blobInfo.filename());

            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            fetch('/api/admin/articles/upload-image', {
              method: 'POST',
              body: formData,
              headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': csrfToken
              },
              credentials: 'same-origin'
            })
            .then(response => response.json())
            .then(data => {
              if (data.path) {
                // Return full URL
                const imageUrl = data.path.startsWith('http') 
                  ? data.path 
                  : `/storage/${data.path}`;
                resolve(imageUrl);
              } else {
                reject('Upload gagal: ' + (data.message || 'Unknown error'));
              }
            })
            .catch(error => {
              reject('Upload error: ' + error.message);
            });
          });
        },
        
        // File picker for media
        file_picker_types: 'image',
        file_picker_callback: (callback, value, meta) => {
          if (meta.filetype === 'image') {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            
            input.onchange = function() {
              const file = this.files[0];
              const reader = new FileReader();
              
              reader.onload = function() {
                // Upload file
                const formData = new FormData();
                formData.append('image', file);
                
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                
                fetch('/api/admin/articles/upload-image', {
                  method: 'POST',
                  body: formData,
                  headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken
                  },
                  credentials: 'same-origin'
                })
                .then(response => response.json())
                .then(data => {
                  if (data.path) {
                    const imageUrl = data.path.startsWith('http') 
                      ? data.path 
                      : `/storage/${data.path}`;
                    callback(imageUrl, { alt: file.name });
                  }
                });
              };
              
              reader.readAsDataURL(file);
            };
            
            input.click();
          }
        },
        
        // Quick toolbars
        quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
        quickbars_insert_toolbar: 'quickimage quicktable',
        
        // Mobile responsive
        mobile: {
          menubar: false,
          plugins: 'autosave lists autolink',
          toolbar: 'undo redo | bold italic | bullist numlist'
        },
        
        // Paste options
        paste_data_images: true,
        paste_as_text: false,
        
        // Autosave
        autosave_ask_before_unload: true,
        autosave_interval: '30s',
        autosave_prefix: 'tinymce-autosave-{path}{query}-{id}-',
        autosave_restore_when_empty: false,
        autosave_retention: '30m',
        
        // Content filtering
        valid_elements: '*[*]',
        extended_valid_elements: 'iframe[src|frameborder|style|scrolling|class|width|height|name|align|id]',
        
        // Link options
        link_default_target: '_blank',
        link_assume_external_targets: true,
        
        // Table options
        table_default_attributes: {
          border: '1'
        },
        table_default_styles: {
          'border-collapse': 'collapse',
          'width': '100%'
        },
        
        // Code sample
        codesample_languages: [
          { text: 'HTML/XML', value: 'markup' },
          { text: 'JavaScript', value: 'javascript' },
          { text: 'CSS', value: 'css' },
          { text: 'PHP', value: 'php' },
          { text: 'Python', value: 'python' },
          { text: 'Java', value: 'java' },
          { text: 'C', value: 'c' },
          { text: 'C++', value: 'cpp' },
          { text: 'C#', value: 'csharp' },
          { text: 'SQL', value: 'sql' }
        ]
      }}
    />
  );
};

TinyMCEEditor.propTypes = {
  content: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string
};

export default TinyMCEEditor;
