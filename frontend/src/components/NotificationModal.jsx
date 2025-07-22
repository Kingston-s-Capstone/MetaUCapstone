import React from 'react';
import { NotificationCenter } from '@novu/notification-center';
import { supabase } from '../SupaBaseClient';
import { useState, useEffect } from 'react';
import './modal.css'

const NotificationCenterModal = ({ isOpen, onClose }) => {
    const [subscriberId, setSubscriberId] = useState(null);
    const applicationIdentifier = import.meta.env.VITE_NOVU_APP_ID;
    
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setSubscriberId(user.id)
            }
        };
        getUser();
    }, []);

    if (!isOpen || !subscriberId) return  null;

    return (
        <div className='modal-overlay' onClick={onClose}>
            <div className='modal-content' onClick={e => e.stopPropagation()}>
                <NotificationCenter
                    subscriberId={subscriberId}
                    applicationIdentifier={applicationIdentifier}
                    colorScheme='light'
                    onClose={onClose}
                />
            </div>
        </div>
    )
};

export default NotificationCenterModal