import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";

export type DialogProps = {
	open?: boolean; // dialog state (controlled)
	onOpenChange?: (open: boolean) => void; // control dialog state
	title: string;
	description: string;
	closeNode?: ReactNode; // closes dialog
	trigger?: ReactNode; // uncontrolled dialog trigger
	children?: ReactNode; // extra content shown after description
};

const DialogDemo = ({
	open,
	onOpenChange,
	title,
	description,
    closeNode,
	trigger,
	children,
}: DialogProps) => (
	<Dialog.Root>
        {trigger != null && open == null && (
            <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
        )}
		<Dialog.Portal>
			<Dialog.Overlay className="fixed inset-0 bg-blackA6 data-[state=open]:animate-overlayShow" />
			<Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-gray1 p-[25px] shadow-[var(--shadow-6)] focus:outline-none data-[state=open]:animate-contentShow">
				<Dialog.Title className="m-0 text-[17px] font-medium text-mauve12">
					{title}
				</Dialog.Title>
				<Dialog.Description className="mb-5 mt-2.5 text-[15px] leading-normal text-mauve11">
					{description}
				</Dialog.Description>
				{children != null && (
                    <div className="mb-4 text-sm">{children}</div>
                )}
				<div className="mt-[25px] flex justify-end">
					<Dialog.Close asChild>
						{closeNode != null && closeNode}
					</Dialog.Close>
				</div>
				<Dialog.Close asChild>
					<button
						className="absolute right-2.5 top-2.5 inline-flex size-[25px] appearance-none items-center justify-center rounded-full text-violet11 bg-gray3 hover:bg-violet4 focus:shadow-[0_0_0_2px] focus:shadow-violet7 focus:outline-none"
						aria-label="Close"
					>
                        x
					</button>
				</Dialog.Close>
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
);

export default DialogDemo;
