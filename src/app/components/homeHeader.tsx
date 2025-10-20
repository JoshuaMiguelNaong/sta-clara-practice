interface HomeHeaderProps {
  email: string | null;
}

export default function HomeHeader({ email }: HomeHeaderProps) {
  return (
    <h1 className="text-2xl font-bold mb-6">
      Welcome, <span className="text-blue-600">{email}</span>
    </h1>
  );
}
