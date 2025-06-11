"use client";

// service
import { userService } from '@/services/userService';
import type * as userType from '@/services/userService';

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
const signUpSchema = yup.object().shape({
    displayName: yup.string().required('Display name is required'),

    username: yup.string().required('Username is required'),

    email: yup.string().email('Invalid email').required('Email is required'),

    password: yup.string().required('Password is required')
    .min(8, 'Must be at least 8 characters')
    .matches(/[a-z]/, 'Must include a lowercase letter')
    .matches(/[A-Z]/, 'Must include an uppercase letter')
    .matches(/[0-9]/, 'Must include a number')
    .matches(/[@$!%*?&#]/, 'Must include a special character'),

    confirmPassword: yup.string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
});

// Define form values type
type SignUpFormValues = yup.InferType<typeof signUpSchema>;

export default function SignUpPage() {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<SignUpFormValues>({
        resolver: yupResolver(signUpSchema),
        defaultValues: {
            displayName: "",
            username: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    });

    const onSubmit = (data: SignUpFormValues) => {
        setIsLoading(true);
        
        const newUser: userType.UserRequest = {
            displayName: data.displayName,
            username: data.username,
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword
        };

        userService.createUser(newUser)
            .then((success) => {
                if (success) {
                    // Handle successful user creation, e.g., redirect to login page or show success message
                    console.log('User created successfully');
                    toast.success(t('signup.successMessage'));
                } else {
                    // Handle failure case
                    console.error('Failed to create user');
                    toast.error(t('signup.errorMessage'));
                }
            })
            .catch((error) => {
                // Handle error case
                console.error('Error creating user:', error);
                toast.error(t('signup.errorMessage'));
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
                        name="displayName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('signup.displayName')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('signup.displayName')} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('signup.username')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('signup.username')} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

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

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('signup.confirmPassword')}</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder={t('signup.password')} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            </> : null}
                        { t('signup.submit')}
                    </Button>
                </form>
            </Form>

            <Button className="m-4" variant={"link"}><Link href={"/sign-in"}>{ t('signup.alreadyHaveAccount')}</Link></Button>
        </>
    );
}