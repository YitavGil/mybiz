"use client";
import { Agency } from "@prisma/client";
import React, { useState } from "react";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import { AlertDialog } from "../ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Form } from "../ui/form";
import { useForm } from "react-hook-form";
import * as z from 'zod';

type Props = {
  data?: Partial<Agency>;
};

const FormSchema = z.object({
  name: z.string().min(2, {message: "Agency name must be at least 2 chars."}),
  companyEmail: z.string()

})

const AgencyDetails = (props: Props) => {
  const { toast } = useToast();
  const router = useRouter();
  const [deleteAgency, setDeleteAgency] = useState(false);
  const form = useForm<z.infer<typeof FormSchema >>();
  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Agency Information</CardTitle>
          <CardDescription>
            Lets create an agency to your bussiness. You can edit agency
            settings later from the agency tabs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form>

          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default AgencyDetails;
