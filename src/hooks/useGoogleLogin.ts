import { useState } from 'react';
import { apiClient } from '../api/axios';

export const useGoogleLogin = () => {
    const [isLoading, setIsLoading] = useState(false);

    const login = async () => {
        setIsLoading(true);
        try {
            const redirectUri = window.location.origin + '/auth/callback';
            const response = await apiClient.get('/auth/google/authorize', {
                params: {
                    redirect_uri: redirectUri
                }
            });

            if (response.data && response.data.authorization_url) {
                window.location.href = response.data.authorization_url;
            } else {
                alert('인증 URL을 불러오지 못했습니다.');
            }
        } catch (error) {
            console.error('Google OAuth URL fetch failed:', error);
            alert('로그인 준비 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return { login, isLoading };
};
