import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useEffect } from 'react';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export const NonDetermenisticModal = (props: { isNonDetermenistic: boolean, setIsNonDetermenistic: (v: boolean) => void }) => {
    const [open, setOpen] = React.useState(false);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        if (props.isNonDetermenistic) {
            setOpen(props.isNonDetermenistic)
            props.setIsNonDetermenistic(false)
        }
    });

    return (
        <div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Ошибка
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Недетерменизм
                    </Typography>
                </Box>
            </Modal>
        </div>
    );
}

export const NonMinimizableModal = (props: { isNonMinimizable: boolean, setIsNonMinimizable: (v: boolean) => void }) => {
    const [open, setOpen] = React.useState(false);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        if (props.isNonMinimizable) {
            setOpen(props.isNonMinimizable)
            props.setIsNonMinimizable(false)
        }
    });

    return (
        <div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Ошибка
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Невозможно минимизровать
                    </Typography>
                </Box>
            </Modal>
        </div>
    );
}