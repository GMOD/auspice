import React from "react";
import { connect } from "react-redux";
// import Card from "../framework/card";
import {
  createViewState,
  createJBrowseTheme,
  JBrowseLinearGenomeView,
  ThemeProvider,
} from "@jbrowse/react-linear-genome-view";

const theme = createJBrowseTheme();

// Data Views

/* 
Load the assembly from metadata
*/

/* 
Load the gene track from JSON (from entropyCreateStateFromJsons)

We want to load the gene array into a FeatureTrack (can FeatureTrack display be configured?)
*/

/* 
Wiggle track of entropy

1. We want the same entropy data as entropy panel (probably inline from entropy)
2. Process the entropy array
3. Put it into wiggle track (Need to make the wiggle track run callback on click (?))
*/

// Future JB2 Work

/* 
1. Floating track labels
2. Ability to upload tracks into embedded LGV
3. Theming
4. Weird width (CSS?) interactions
*/

// Question is whether we want to replace diversity panel or just add browser

// ---------------------------------------------------------------------

const defaultSession = {
  name: "My session",
  view: {
    id: "linearGenomeView",
    type: "LinearGenomeView",
    tracks: [
      {
        type: "ReferenceSequenceTrack",
        configuration: "Sars-Cov2-ReferenceSequenceTrack",
        displays: [
          {
            type: "LinearReferenceSequenceDisplay",
            configuration: "Sars-Cov2-ReferenceSequenceTrack-LinearReferenceSequenceDisplay",
          },
        ],
      },
    ],
  },
};

class GenomeView extends React.Component {
  render() {
    console.log(this.props);
    console.log("Now using metadata");

    // add assembly from metadata
    const assembly = {
      name: "Sars-Cov2",
      sequence: {
        type: "ReferenceSequenceTrack",
        trackId: "Sars-Cov2-ReferenceSequenceTrack",
        adapter: {
          type: "FromConfigSequenceAdapter",
          features: [
            {
              refName: "Sars-Cov2",
              uniqueId: "Sars-Cov2",
              start: 0,
              end: this.props.metadata.rootSequence.nuc.length,
              seq: this.props.metadata.rootSequence.nuc,
            },
          ],
        },
      },
    };

    // add tracks from annotations
    const processedAnnotations = this.props.annotations.map((annotation) => {
      return {
        refName: "Sars-Cov2",
        name: annotation.prot,
        uniqueId: annotation.idx,
        start: annotation.start,
        end: annotation.end,
        fill: annotation.fill,
      };
    });

    const tracks = [
      {
        type: "FeatureTrack",
        name: "Sars-Cov2 Annotations",
        trackId: "sars-cov2-annotations",
        assemblyNames: ["Sars-Cov2"],
        category: ["Annotation"],
        adapter: {
          type: "Gff3TabixAdapter",
          gffGzLocation: {
            uri: "https://jbrowse.org/genomes/sars-cov2/sars-cov2-annotations.sorted.gff.gz",
          },
          index: {
            location: {
              uri: "https://jbrowse.org/genomes/sars-cov2/sars-cov2-annotations.sorted.gff.gz.tbi",
            },
          },
        },
      },
      {
        type: "FeatureTrack",
        name: "Nextstrain annotations",
        trackId: "nextstrain-annotations",
        assemblyNames: ["Sars-Cov2"],
        category: ["Annotation"],
        adapter: {
          type: "FromConfigAdapter",
          features: processedAnnotations
        },
        displays: [
          {
            type: "LinearBasicDisplay",
            displayId: "nextstrain-color-display",
            renderer: {
              type: "SvgFeatureRenderer",
              color1: "function(feature) { return feature.get('fill') || 'black' }"
            }
          }
        ]
      }
    ];
    
    // move default session here and set it up

    const viewState = createViewState({
      assembly,
      tracks,
      location: "Sars-Cov2:493..29,903",
      defaultSession,
    });

    return (
      // Ultimately I will want to wrap this in a Card for consistency
      <ThemeProvider theme={theme}>
        <JBrowseLinearGenomeView viewState={viewState} />
      </ThemeProvider>
    );
  }
}

function mapStateToProps(state) {
  return {
    annotations: state.entropy.annotations,
    geneMap: state.entropy.geneMap,
    geneLength: state.controls.geneLength,
    metadata: state.metadata,
  };
}
export default connect(mapStateToProps)(GenomeView);
