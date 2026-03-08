'use client';

import { useEffect, useState } from 'react';
import {
	Alert,
	Avatar,
	Box,
	Button,
	CircularProgress,
	MenuItem,
	Paper,
	Select,
	Snackbar,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import type { SubscriptionPlan, UserDocument } from '../../lib/types/user';


export function UsersClient() {
	const [users, setUsers] = useState<UserDocument[]>([]);
	const [loading, setLoading] = useState(true);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const [saving, setSaving] = useState<Record<string, boolean>>({});
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: 'success' | 'error';
	}>({ open: false, message: '', severity: 'success' });

	const fetchUsers = async () => {
		setLoading(true);
		setFetchError(null);
		try {
			const res = await fetch('/api/users');
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = (await res.json()) as UserDocument[];
			setUsers(data);
		} catch (err) {
			setFetchError(String(err));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const handlePlanChange = async (userId: string, plan: SubscriptionPlan) => {
		setSaving((prev) => ({ ...prev, [userId]: true }));
		try {
			const res = await fetch(`/api/users/${userId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ subscription: plan }),
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);

			setUsers((prev) =>
				prev.map((u) => (u._id === userId ? { ...u, subscription: plan } : u)),
			);
			setSnackbar({
				open: true,
				message: `Subscription updated to "${plan}"`,
				severity: 'success',
			});
		} catch (err) {
			setSnackbar({
				open: true,
				message: `Failed to update: ${String(err)}`,
				severity: 'error',
			});
		} finally {
			setSaving((prev) => ({ ...prev, [userId]: false }));
		}
	};

	if (loading) {
		return (
			<Box display='flex' justifyContent='center' py={8}>
				<CircularProgress />
			</Box>
		);
	}

	if (fetchError) {
		return (
			<Alert severity='error' sx={{ mt: 2 }}>
				Failed to load users: {fetchError}
			</Alert>
		);
	}

	return (
		<Box>
			<Box display='flex' alignItems='center' justifyContent='space-between' mb={3}>
				<Typography variant='body2' color='text.secondary'>
					{users.length} user{users.length !== 1 ? 's' : ''} registered
				</Typography>
				<Button
					size='small'
					startIcon={<RefreshOutlinedIcon />}
					onClick={fetchUsers}
					variant='outlined'
				>
					Refresh
				</Button>
			</Box>

			{users.length === 0 ? (
				<Alert severity='info'>No users found.</Alert>
			) : (
				<TableContainer component={Paper} variant='outlined'>
					<Table size='small'>
						<TableHead>
							<TableRow>
								<TableCell>User</TableCell>
								<TableCell>Email</TableCell>
								<TableCell>Roles</TableCell>
								<TableCell align='right'>Subscription</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{users.map((user) => (
								<TableRow key={user._id}>
									<TableCell>
										<Box display='flex' alignItems='center' gap={1.5}>
											<Avatar
												src={user.image ?? undefined}
												alt={user.name ?? user.email}
												sx={{ width: 32, height: 32 }}
											/>
											<Typography variant='body2' fontWeight={500}>
												{user.name ?? '—'}
											</Typography>
										</Box>
									</TableCell>
									<TableCell>
										<Typography variant='body2' color='text.secondary'>
											{user.email}
										</Typography>
									</TableCell>
									<TableCell>
										<Typography variant='body2' color='text.secondary'>
											—
										</Typography>
									</TableCell>
									<TableCell align='right'>
										<Select
											size='small'
											value={user.subscription}
											onChange={(e: SelectChangeEvent) =>
												handlePlanChange(user._id, e.target.value as SubscriptionPlan)
											}
											disabled={!!saving[user._id]}
											sx={{ minWidth: 100 }}
										>
											<MenuItem value='free'>Free</MenuItem>
											<MenuItem value='pro'>Pro</MenuItem>
										</Select>
										{saving[user._id] && (
											<CircularProgress size={16} sx={{ ml: 1 }} />
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			)}

			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert
					severity={snackbar.severity}
					onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}
