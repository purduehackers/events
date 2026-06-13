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
			<Dialog.Overlay className="z-400 fixed inset-0 bg-zinc-900/60" />
			<Dialog.Content className="z-450 bg-black px-10 py-8 border-1 border-zinc-800 fixed left-1/2 top-1/2 w-[90vw] max-w-[430px] h-fit max-h-[80vh] -translate-x-1/2 -translate-y-1/2 focus:outline-none">
				<Dialog.Title className="m-0 font-pixel text-xl font-medium text-white">
					{title}
				</Dialog.Title>
				<Dialog.Description className="mb-5 mt-2.5 font-mono text-[15px] leading-normal text-zinc-400">
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
						className="font-pixel absolute right-2.5 top-2.5 inline-flex size-[25px] appearance-none items-center justify-center text-white focus:outline-none"
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
