# TODO: implement


def main():
    # Read in all events

    # For each event:
    #   Get the target slug path (/hack-night/5.25.1/)
    #   Create an images/ path inside target slug
    #   For each image associated with the event:
    #     Check if Sanity has modified the file extension w/o format conversion
    #       If so, restore original file extension
    #     Refer to image metadata file for original filename
    #     Copy image into slug->images path
    #     Add image to Markdown metadata
    #   Create Markdown file named event.md inside with event metadata

    pass


if __name__=="__main__":
    main()