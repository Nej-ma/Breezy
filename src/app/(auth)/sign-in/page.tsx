'use client'

// service
import { userService } from '@/services/authService';
import type * as userType from '@/services/authService';

// ui components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from "lucide-react";
import Link from 'next/link';

// hooks
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useState } from 'react';

// validation schema
const signInSchema = yup.object().shape({
    email: yup.string().email('Invalid email').required('Email is required'),

    password: yup.string().required('Password is required')
    .min(8, 'Must be at least 8 characters')
    .matches(/[a-z]/, 'Must include a lowercase letter')
    .matches(/[A-Z]/, 'Must include an uppercase letter')
    .matches(/[0-9]/, 'Must include a number')
    .matches(/[@$!%*?&#]/, 'Must include a special character')
});

// Define form values type
type SignInFormValues = yup.InferType<typeof signInSchema>;

export default function SignInPage() {
    const { t } = useTranslation();
        const [isLoading, setIsLoading] = useState(false);
    
        const form = useForm<SignInFormValues>({
            resolver: yupResolver(signInSchema),
            defaultValues: {
                email: "",
                password: ""
            }
        });
    
        const onSubmit = (data: SignInFormValues) => {
            setIsLoading(true);
            
            const newUser: userType.Login = {
                email: data.email,
                password: data.password
            };

            userService.login(newUser)
                .then((response) => {
                    if (response) {
                        toast.success(t('signup.signinSuccess'));
                        // Redirect to home or dashboard
                        window.location.href = '/';
                    } else {
                        toast.error(t('signup.signinError'));
                    }
                })
                .catch((error) => {
                    console.error("Login error:", error);
                    toast.error(t('signup.signinError'));
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    
        return (
            <>
                <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col max-w-md space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('signup.email')}</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder={t('signup.email')} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
    
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('signup.password')}</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder={t('signup.password')} {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            {t('signup.passwordDescription')}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
    
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    </> : null}
                                { t('signup.signin')}
                            </Button>
                        </form>
                </Form>

                <Link href={"/sign-up"}><Button className="m-4" variant={"link"}>{ t('signup.noAccount')}</Button></Link>
            </>
        );
}