'use client';

import { useCallback, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface FileUploadDropzoneProps {
	accept: string;
	maxSizeMb?: number;
	onFileSelected: (file: File) => void;
	disabled?: boolean;
}

export function FileUploadDropzone({
	accept,
	maxSizeMb = 50,
	onFileSelected,
	disabled = false,
}: FileUploadDropzoneProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [fileName, setFileName] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		if (!disabled) setIsDragging(true);
	}, [disabled]);

	const handleDragLeave = useCallback(() => {
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		if (disabled) return;

		const file = e.dataTransfer.files[0];
		if (file) {
			setFileName(file.name);
			onFileSelected(file);
		}
	}, [disabled, onFileSelected]);

	const handleClick = () => {
		if (!disabled) {
			inputRef.current?.click();
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFileName(file.name);
			onFileSelected(file);
		}
	};

	return (
		<Box
			onClick={handleClick}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			sx={{
				border: '2px dashed',
				borderColor: isDragging ? 'primary.main' : 'divider',
				borderRadius: 2,
				p: 4,
				textAlign: 'center',
				cursor: disabled ? 'not-allowed' : 'pointer',
				bgcolor: isDragging ? 'action.hover' : 'background.paper',
				opacity: disabled ? 0.5 : 1,
				transition: 'all 0.2s ease',
				'&:hover': disabled ? {} : {
					borderColor: 'primary.main',
					bgcolor: 'action.hover',
				},
			}}
		>
			<input
				ref={inputRef}
				type="file"
				accept={accept}
				onChange={handleInputChange}
				style={{ display: 'none' }}
			/>
			<CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
			<Typography variant="body1" gutterBottom>
				{fileName ?? 'Drag & drop a file here, or click to select'}
			</Typography>
			<Typography variant="body2" color="text.secondary">
				Max file size: {maxSizeMb}MB
			</Typography>
		</Box>
	);
}
