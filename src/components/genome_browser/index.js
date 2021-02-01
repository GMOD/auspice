import React from "react";
import { connect } from "react-redux";
import Card from "../framework/card";
import {
  createViewState,
  createJBrowseTheme,
  JBrowseLinearGenomeView,
  ThemeProvider,
} from "@jbrowse/react-linear-genome-view";
import { width } from "../../util/globals";

const theme = createJBrowseTheme({
  palette: {
    primary: {
      main: "#5da8a3",
    },
    secondary: {
      main: "#333",
    },
  },
});

// Data Views

/* 
Load the assembly from metadata ✅
*/

/* 
Load the gene track from JSON ✅

We want to load the gene array into a FeatureTrack (can FeatureTrack display be configured?)
*/

/* 
Wiggle track of entropy ✅

1. We want the same entropy data as entropy panel (probably inline from entropy)
2. Process the entropy array
3. Put it into wiggle track (Need to make the wiggle track run callback on click (?))
*/

// Future JB2 Work

/* 
1. Floating track labels (mentioned in issue)
2. Ability to upload tracks into embedded LGV (opened issue)
3. Theming
4. Weird width (CSS?) interactions
*/

// Question is whether we want to replace diversity panel or just add browser

// ---------------------------------------------------------------------

class GenomeView extends React.Component {
  render() {
    // console.log("Props including connected state:");
    // console.log(this.props);

    // avoid error with rootSequence (should add spinner for loading maybe)
    if (this.props.metadata.rootSequence == undefined) {
      return <></>;
    }

    // add assembly from metadata
    const assembly = {
      name: "NC_045512.2",
      sequence: {
        type: "ReferenceSequenceTrack",
        trackId: "NC_045512.2-ReferenceSequenceTrack",
        adapter: {
          type: "FromConfigSequenceAdapter",
          features: [
            {
              refName: "NC_045512.2",
              uniqueId: "NC_045512.2",
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
        refName: "NC_045512.2",
        name: annotation.prot,
        uniqueId: annotation.idx,
        start: annotation.start,
        end: annotation.end,
        fill: annotation.fill,
      };
    });

    const processedEntropy = this.props.bars.map((bar) => {
      return {
        refName: "NC_045512.2",
        score: Number(bar.y),
        start: bar.x,
        end: bar.x + 1,
        uniqueId: String(bar.x),
      };
    });

    const tracks = [
      {
        type: "FeatureTrack",
        name: "NC_045512.2 Annotations",
        trackId: "NC_045512.2-annotations",
        assemblyNames: ["NC_045512.2"],
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
        assemblyNames: ["NC_045512.2"],
        category: ["Annotation"],
        adapter: {
          type: "FromConfigAdapter",
          features: processedAnnotations,
        },
        displays: [
          {
            type: "LinearBasicDisplay",
            displayId: "nextstrain-color-display",
            renderer: {
              type: "SvgFeatureRenderer",
              color1: "function(feature) { return feature.get('fill') || 'black' }",
            },
          },
        ],
      },
      {
        type: "QuantitativeTrack",
        name: "Entropy score",
        trackId: "entropy-score",
        assemblyNames: ["NC_045512.2"],
        category: ["Annotation"],
        adapter: {
          type: "FromConfigAdapter",
          features: processedEntropy,
        },
      },
    ];

    // move default session here and set it up
    const defaultSession = {
      name: "My session",
      view: {
        id: "linearGenomeView",
        type: "LinearGenomeView",
        // offsetPx: 0,
        // bpPerPx: 29,
        tracks: [
          {
            type: "QuantitativeTrack",
            configuration: "entropy-score",
            displays: [
              {
                type: "LinearWiggleDisplay",
                displayId: "entropy-score-LinearWiggleDisplay",
                renderers: {
                  DensityRenderer: { type: "DensityRenderer" },
                  XYPlotRenderer: { type: "XYPlotRenderer" },
                  LinePlotRenderer: { type: "LinePlotRenderer" },
                },
              },
            ],
          },
          {
            type: "FeatureTrack",
            configuration: "nextstrain-annotations",
            displays: [
              {
                type: "LinearBasicDisplay",
                configuration: "nextstrain-color-display",
              },
            ],
          },
          {
            type: "ReferenceSequenceTrack",
            configuration: "NC_045512.2-ReferenceSequenceTrack",
            displays: [
              {
                type: "LinearReferenceSequenceDisplay",
                configuration: "NC_045512.2-ReferenceSequenceTrack-LinearReferenceSequenceDisplay",
              },
            ],
          },
          {
            type: "FeatureTrack",
            configuration: "NC_045512.2-annotations",
            displays: [
              {
                type: "LinearBasicDisplay"
              }
            ]
          }
        ],
      },
    };

    const location = this.props.zoomMin
      ? `NC_045512.2:${this.props.zoomMin}..${this.props.zoomMax}`
      : "NC_045512.2:1..29,903";

    console.log({ location });

    const viewState = createViewState({
      assembly,
      tracks,
      location,
      defaultSession,
    });

    // viewState.session.view.navToLocString(location)

    return (
      <Card title="Genome Browser">
        <div style={{ width: this.props.width }}>
          <ThemeProvider theme={theme}>
            <JBrowseLinearGenomeView viewState={viewState} />
          </ThemeProvider>
        </div>
      </Card>
    );
  }
}

function mapStateToProps(state) {
  return {
    annotations: state.entropy.annotations,
    geneMap: state.entropy.geneMap,
    bars: state.entropy.bars,
    zoomMin: state.entropy.zoomMin,
    zoomMax: state.entropy.zoomMax,
    geneLength: state.controls.geneLength,
    metadata: state.metadata,
  };
}
export default connect(mapStateToProps)(GenomeView);
