import { Separator } from "@/components/ui/separator";

export const Footer = () => {
  return (
    <footer className="w-full py-6 mt-auto">
      <Separator className="mb-6" />
      <div className="container text-center text-sm text-gray-500">
        <p>Conceptualised and presented by Ignite Consulting</p>
      </div>
    </footer>
  );
};