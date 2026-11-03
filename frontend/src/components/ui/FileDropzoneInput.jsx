import React, { useState, useId, useEffect } from 'react';
import InputWrapper from './InputWrapper';
import styles from './styles/FileDropzoneInput.module.css';

const FileDropzoneInput = ({ label, labelPlacement, id: externalId, error, onChange, accept = '*/*', multiple = false, maxFiles, maxFileSize, value, info, ...props }) => {
  const generatedId = useId();
  const id = externalId || generatedId;

  const [isDragActive, setIsDragActive] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [localError, setLocalError] = useState('');

  // Sync internal state with external value and generate previews
  useEffect(() => {
    let currentFiles = [];
    if (Array.isArray(value)) {
      currentFiles = value;
    } else if (value) {
      currentFiles = [value];
    }
    
    const objectUrls = [];
    const newPreviews = currentFiles.map(file => {
      // If it's a File object with a type starting with 'image/'
      if (file && file.type && file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        objectUrls.push(url);
        return { name: file.name, url, isImage: true, file };
      }
      return { name: file?.name || 'File', isImage: false, file };
    });
    
    setPreviews(newPreviews);
    
    return () => {
       // Cleanup URLs to avoid memory leaks
       objectUrls.forEach(URL.revokeObjectURL);
    };
  }, [value]);

  const processFiles = (files) => {
    let filesArray = Array.from(files);
    setLocalError('');
    
    if (maxFileSize) {
      const validFiles = filesArray.filter(f => f.size <= maxFileSize);
      if (validFiles.length < filesArray.length) {
        setLocalError(`Some files were rejected because they exceed the maximum size of ${maxFileSize / (1024 * 1024)}MB.`);
      }
      filesArray = validFiles;
    }

    let allFiles = filesArray;

    if (multiple) {
      // Append to existing value
      const existing = Array.isArray(value) ? value : (value ? [value] : []);
      allFiles = [...existing, ...filesArray];
      
      // Deduplicate by name and size
      const uniqueFiles = [];
      const seen = new Set();
      for (const f of allFiles) {
        const key = f.name + '-' + f.size;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueFiles.push(f);
        }
      }
      allFiles = uniqueFiles;
      
      if (maxFiles && allFiles.length > maxFiles) {
        allFiles = allFiles.slice(0, maxFiles);
        setLocalError(`You can only select up to ${maxFiles} files.`);
      }
    } else {
      // If not multiple, just take the first one
      allFiles = [filesArray[0]].filter(Boolean);
    }

    if (onChange) {
      onChange({ target: { id, value: multiple ? allFiles : allFiles[0] || null } });
    }
  };

  const removeFile = (e, indexToRemove) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentFiles = Array.isArray(value) ? [...value] : (value ? [value] : []);
    currentFiles.splice(indexToRemove, 1);
    
    if (onChange) {
       onChange({ target: { id, value: multiple ? currentFiles : currentFiles[0] || null } });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true);
    else if (e.type === "dragleave") setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelection = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input value so same file can be selected again if removed
      e.target.value = '';
    }
  };

  return (
    <InputWrapper label={label} labelPlacement={labelPlacement} htmlFor={id} error={error || localError} info={info}>
      <div 
        className={`${styles.dropzone} ${isDragActive ? styles.activeDrag : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          id={id} 
          className={styles.hiddenInput} 
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelection}
          {...props}
        />
        
        {previews.length > 0 ? (
          <div className={styles.previewContainer}>
             <div className={styles.previewGrid}>
               {previews.map((preview, index) => (
                 <div key={index} className={styles.previewItem}>
                    {preview.isImage ? (
                      <img src={preview.url} alt={preview.name} className={styles.previewImage} />
                    ) : (
                      <div className={styles.fileIcon}>📄</div>
                    )}
                    <button type="button" className={styles.removeBtn} onClick={(e) => removeFile(e, index)}>×</button>
                    <div className={styles.previewName}>{preview.name}</div>
                 </div>
               ))}
               {(!maxFiles || previews.length < maxFiles) && multiple && (
                 <label htmlFor={id} className={styles.addMoreBtn} onClick={(e) => e.stopPropagation()}>
                   <span className={styles.addMoreIcon}>+</span>
                   <span>Add more</span>
                 </label>
               )}
             </div>
          </div>
        ) : (
          <label htmlFor={id} className={styles.innerLabel}>
            <span>Drag & drop source document here or <span className={styles.browseText}>browse</span></span>
          </label>
        )}
      </div>
    </InputWrapper>
  );
};

export default FileDropzoneInput;